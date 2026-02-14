import { pool } from '../config/db.js';

const getPayments = async () => {
    try {
        const query = `
            SELECT p.payment_id, p.order_id, p.amount, p.payment_status, 
                   p.reference_number, p.bank_slip_url, p.payment_date,
                   pm.method_name as payment_method,
                   c.full_name as customer_name,
                   o.total_amount as order_total
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            JOIN customers c ON o.customer_id = c.customer_id
            JOIN payment_methods pm ON p.method_id = pm.method_id
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

        // Get bank transfer method ID
        const methodQuery = `SELECT method_id FROM payment_methods WHERE method_name = 'BANK_TRANSFER'`;
        const methodResult = await pool.query(methodQuery);
        const methodId = methodResult.rows[0]?.method_id;

        if (!methodId) {
            throw new Error("Bank transfer payment method not configured");
        }

        // Check if payment record exists
        const paymentQuery = `SELECT * FROM payments WHERE order_id = $1`;
        const paymentResult = await pool.query(paymentQuery, [orderId]);

        if (paymentResult.rows.length > 0) {
            // Update existing payment
            const updateQuery = `
                UPDATE payments 
                SET bank_slip_url = $1, payment_status = 'PENDING', method_id = $2, reference_number = $3
                WHERE order_id = $4
                RETURNING *
            `;
            await pool.query(updateQuery, [slipUrl, methodId, `SLIP_${Date.now()}`, orderId]);
        } else {
            // Insert new payment
            const insertQuery = `
                INSERT INTO payments (order_id, method_id, amount, payment_status, bank_slip_url, reference_number) 
                VALUES ($1, $2, $3, 'PENDING', $4, $5)
                RETURNING *
            `;
            await pool.query(insertQuery, [orderId, methodId, order.total_amount, slipUrl, `SLIP_${Date.now()}`]);
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
                confirmation_date = NOW(),
                notes = $4
            WHERE payment_id = $5
            RETURNING *
        `;
        
        const paymentResult = await client.query(updatePaymentQuery, [
            status, 
            verifierId, 
            verifierId,
            `Payment ${status.toLowerCase()} by ${options.confirmedBy || 'system'}`,
            paymentId
        ]);

        if (paymentResult.rows.length === 0) {
            throw new Error("Payment not found");
        }

        const payment = paymentResult.rows[0];

        if (status === 'COMPLETED') {
            // Get processing status ID
            const statusQuery = `SELECT status_id FROM order_statuses WHERE status_name = 'PROCESSING'`;
            const statusResult = await client.query(statusQuery);
            const processingStatusId = statusResult.rows[0]?.status_id;
            
            if (processingStatusId) {
                // Get current order status for history
                const currentOrderQuery = `
                    SELECT o.status_id, os.status_name 
                    FROM orders o 
                    JOIN order_statuses os ON o.status_id = os.status_id 
                    WHERE o.order_id = $1
                `;
                const currentOrderResult = await client.query(currentOrderQuery, [payment.order_id]);
                const currentStatusId = currentOrderResult.rows[0]?.status_id;
                
                // Update order status to PROCESSING when payment is confirmed
                const updateOrderQuery = `
                    UPDATE orders 
                    SET status_id = $1
                    WHERE order_id = $2 AND status_id != $1
                    RETURNING *
                `;
                
                const orderResult = await client.query(updateOrderQuery, [processingStatusId, payment.order_id]);
                
                if (orderResult.rows.length > 0) {
                    // Log status change in history
                    const historyQuery = `
                        INSERT INTO order_status_history (order_id, old_status_id, new_status_id, changed_by, reason)
                        VALUES ($1, $2, $3, $4, $5)
                    `;
                    
                    await client.query(historyQuery, [
                        payment.order_id, 
                        currentStatusId,
                        processingStatusId, 
                        verifierId, 
                        'Payment confirmed - order moved to processing'
                    ]);
                }
            }
        }

        // Log the payment confirmation activity
        const activityQuery = `
            INSERT INTO activity_logs (actor_id, actor_type, action_type, description, target_table, target_id)
            VALUES ($1, 'EMPLOYEE', 'PAYMENT_CONFIRMATION', $2, 'payments', $3)
        `;
        
        await client.query(activityQuery, [
            verifierId, 
            `Payment ${status.toLowerCase()} for Order #${payment.order_id} by ${options.confirmedBy || 'system'}`, 
            payment.payment_id
        ]);

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
