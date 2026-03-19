import { pool } from '../config/db.js';

const getPayments = async () => {
    try {
        const query = `
            SELECT p.payment_id, p.order_id, p.amount, p.payment_status, 
                   p.bank_slip_url, p.payment_date,
                   p.payment_method,
                   c.full_name as customer_name,
                   o.total_amount as order_total
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            JOIN customers c ON o.customer_id = c.customer_id
            ORDER BY p.payment_date DESC
        `;
        const result = await pool.query(query);
        return result.rows || [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};

const uploadBankSlip = async (userId, orderId, slipUrl) => {
    try {
        // Check if order exists and belongs to user
        const orderQuery = `SELECT * FROM orders WHERE order_id = $1 AND customer_id = $2`;
        const orderResult = await pool.query(orderQuery, [orderId, userId]);
        
        if (orderResult.rows.length === 0) {
            throw new Error("Order not found");
        }

        const order = orderResult.rows[0];

        // Check if payment record exists
        const paymentQuery = `SELECT * FROM payments WHERE order_id = $1`;
        const paymentResult = await pool.query(paymentQuery, [orderId]);

        if (paymentResult.rows.length > 0) {
            // Update existing payment
            const updateQuery = `
                UPDATE payments 
                SET bank_slip_url = $1, payment_status = 'PENDING', payment_method = 'BANK_TRANSFER'
                WHERE order_id = $2
                RETURNING *
            `;
            await pool.query(updateQuery, [slipUrl, orderId]);
        } else {
            // Insert new payment
            const insertQuery = `
                INSERT INTO payments (order_id, payment_method, amount, payment_status, bank_slip_url) 
                VALUES ($1, 'BANK_TRANSFER', $2, 'PENDING', $3)
                RETURNING *
            `;
            await pool.query(insertQuery, [orderId, order.total_amount, slipUrl]);
        }

        return { message: "Bank slip uploaded successfully" };
    } catch (error) {
        console.error('Error uploading bank slip:', error);
        throw error;
    }
};

const confirmPayment = async (paymentId, status, verifierId, options = {}) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Update payment status with enhanced tracking
        const updatePaymentQuery = `
            UPDATE payments 
            SET payment_status = $1, 
                verified_by = $2, 
                confirmed_by = $3,
                confirmation_date = NOW()
            WHERE payment_id = $4
            RETURNING *
        `;
        
        const paymentResult = await client.query(updatePaymentQuery, [
            status, 
            verifierId, 
            verifierId,
            paymentId
        ]);

        if (paymentResult.rows.length === 0) {
            throw new Error("Payment not found");
        }

        const payment = paymentResult.rows[0];

        if (status === 'COMPLETED') {
            // Update order status to PROCESSING when payment is confirmed
            const updateOrderQuery = `
                UPDATE orders 
                SET order_status = 'PROCESSING'
                WHERE order_id = $1 AND order_status != 'PROCESSING'
                RETURNING *
            `;
            
            const orderResult = await client.query(updateOrderQuery, [payment.order_id]);
            
            if (orderResult.rows.length > 0) {
                // Log activity
                const activityQuery = `
                    INSERT INTO activity_logs (employee_id, actor_type, action)
                    VALUES ($1, 'EMPLOYEE', $2)
                `;
                
                await client.query(activityQuery, [
                    verifierId, 
                    `Payment confirmed and order #${payment.order_id} moved to PROCESSING`
                ]);
            }
        }

        await client.query('COMMIT');
        
        return { 
            message: status === 'COMPLETED' ? "Payment confirmed successfully" : "Payment status updated",
            payment: payment,
            orderUpdated: status === 'COMPLETED'
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error confirming payment:', error);
        throw error;
    } finally {
        client.release();
    }
};

export {
    getPayments,
    uploadBankSlip,
    confirmPayment
};
