import { pool } from '../config/db.js';
import * as salesService from './salesService.js';

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

        // Log the activity for the salesperson to see
        const logQuery = `
            INSERT INTO activity_logs (customer_id, action_type, actor_type, action)
            VALUES ($1, 'PAYMENT_UPLOAD', 'CUSTOMER', $2)
        `;
        await pool.query(logQuery, [userId, `Bank slip uploaded for order #${orderId}`]);

        return { message: "Bank slip uploaded successfully" };
    } catch (error) {
        console.error('Error uploading bank slip:', error);
        throw error;
    }
};

const confirmPayment = async (paymentId, order_status, verifierId, options = {}) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Update payment order_status with enhanced tracking
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
            order_status, 
            verifierId, 
            verifierId,
            paymentId
        ]);

        if (paymentResult.rows.length === 0) {
            throw new Error("Payment not found");
        }

        const payment = paymentResult.rows[0];

        if (order_status === 'COMPLETED') {
            // Update order order_status to PROCESSING when payment is confirmed
            const updateOrderQuery = `
                UPDATE orders 
                SET order_status = 'PROCESSING',
                    verified_at = NOW(),
                    verified_by = $2
                WHERE order_id = $1
                RETURNING *
            `;
            
            const orderResult = await client.query(updateOrderQuery, [payment.order_id, verifierId]);
            
            if (orderResult.rows.length > 0) {
                // Log activity
                const activityQuery = `
                    INSERT INTO activity_logs (employee_id, actor_type, action_type, action)
                    VALUES ($1, 'EMPLOYEE', $2, $3)
                `;
                
                await client.query(activityQuery, [
                    verifierId, 
                    'PAYMENT_CONFIRMATION',
                    `Payment confirmed and order #${payment.order_id} moved to PROCESSING`
                ]);
            }

            // Send notification to customer
            try {
                await salesService.sendConfirmation(payment.order_id, 'payment_confirmation', 'Salesperson', verifierId);
            } catch (notifyErr) {
                console.error("Failed to send payment confirmation notification:", notifyErr);
                // Don't fail the whole transaction if notification fails
            }
        } else if (order_status === 'FAILED') {
            // Send rejection notification
            try {
                await salesService.sendConfirmation(payment.order_id, 'payment_rejection', 'Salesperson', verifierId);
            } catch (notifyErr) {
                console.error("Failed to send payment rejection notification:", notifyErr);
            }
        }

        await client.query('COMMIT');
        
        return { 
            message: order_status === 'COMPLETED' ? "Payment confirmed successfully" : "Payment order_status updated",
            payment: payment,
            orderUpdated: order_status === 'COMPLETED'
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
