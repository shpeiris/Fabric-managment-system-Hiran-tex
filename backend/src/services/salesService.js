import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

const getSalesDashboardStats = async () => {
    const queries = {
        totalSales: `
            SELECT SUM(total_amount) as total 
            FROM orders 
            WHERE order_status = 'DELIVERED'
        `,
        monthlySales: `
            SELECT SUM(total_amount) as total 
            FROM orders 
            WHERE order_status = 'DELIVERED' 
            AND EXTRACT(MONTH FROM order_date) = EXTRACT(MONTH FROM CURRENT_DATE) 
            AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `,
        totalCustomers: "SELECT COUNT(*) as total FROM customers",
        pendingOrders: `
            SELECT COUNT(*) as total 
            FROM orders 
            WHERE order_status IN ('PENDING', 'PROCESSING')
        `,
        monthlyTrend: `
            SELECT 
                TO_CHAR(order_date, 'Mon YYYY') as month,
                SUM(total_amount) as total,
                COUNT(*) as order_count
            FROM orders
            WHERE order_status = 'DELIVERED'
            AND order_date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY TO_CHAR(order_date, 'Mon YYYY'), EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date)
            ORDER BY EXTRACT(YEAR FROM order_date) DESC, EXTRACT(MONTH FROM order_date) DESC
        `,
        recentOrders: `
            SELECT o.order_id, o.customer_id, o.total_amount, o.order_date,
                   o.order_status,
                   c.full_name as customer_name,
                   c.tel as phone_number,
                   p.payment_status,
                   p.payment_id,
                   p.payment_method,
                   p.bank_slip_url,
                   fb.overall_rating as feedback_rating,
                   fb.comments as feedback_comments,
                   (
                       SELECT JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'fabric_name', f.name,
                               'quantity', oi.quantity,
                               'unit_price', oi.unit_price,
                               'total_price', oi.total_price
                           )
                       )
                       FROM order_items oi
                       LEFT JOIN fabrics f ON oi.fabric_id = f.fabric_id
                       WHERE oi.order_id = o.order_id
                   ) as items
            FROM orders o 
            LEFT JOIN customers c ON o.customer_id = c.customer_id 
            LEFT JOIN (
                SELECT DISTINCT ON (order_id) *
                FROM payments
                ORDER BY order_id, payment_date DESC
            ) p ON o.order_id = p.order_id
            LEFT JOIN feedback fb ON o.order_id = fb.order_id
            ORDER BY o.order_date DESC LIMIT 5
        `,
        verificationRequired: `
            SELECT COUNT(*) as total 
            FROM orders 
            WHERE order_status = 'PENDING' AND verified_at IS NULL
        `
    };

    try {
        const [totalSales, monthlySales, customers, pending, recentOrders, verificationRequired, monthlyTrend] = await Promise.all([
            pool.query(queries.totalSales),
            pool.query(queries.monthlySales),
            pool.query(queries.totalCustomers),
            pool.query(queries.pendingOrders),
            pool.query(queries.recentOrders),
            pool.query(queries.verificationRequired),
            pool.query(queries.monthlyTrend)
        ]);

        return {
            stats: {
                totalSales: parseFloat(totalSales.rows[0]?.total || 0),
                monthlySales: parseFloat(monthlySales.rows[0]?.total || 0),
                totalCustomers: parseInt(customers.rows[0]?.total || 0),
                pendingOrders: parseInt(pending.rows[0]?.total || 0),
                verificationRequired: parseInt(verificationRequired.rows[0]?.total || 0)
            },
            recentOrders: recentOrders.rows || [],
            monthlyTrend: monthlyTrend.rows || []
        };
    } catch (error) {
        console.error('Error fetching sales dashboard stats:', error);
        throw error;
    }
};

const getCustomerStats = async () => {
    try {
        const query = `
            SELECT c.customer_id, c.full_name, c.email, c.address, c.created_at as registration_date,
                   c.tel as phone,
                   COUNT(DISTINCT o.order_id) as total_orders,
                   COALESCE(SUM(o.total_amount), 0) as total_spent
            FROM customers c
            LEFT JOIN orders o ON c.customer_id = o.customer_id
            GROUP BY c.customer_id, c.full_name, c.email, c.address, c.created_at, c.tel
            ORDER BY total_spent DESC
        `;
        const result = await pool.query(query);
        return result.rows || [];
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        throw error;
    }
};

const getPendingVerifications = async () => {
    try {
        const query = `
            SELECT DISTINCT ON (o.order_id)
                   o.*, 
                   c.full_name as customer_name,
                   c.email as customer_email,
                   p.bank_slip_url,
                   p.payment_status,
                   p.payment_method,
                   (
                       SELECT JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'order_item_id', oi.order_item_id,
                               'fabric_id', oi.fabric_id,
                               'quantity', oi.quantity,
                               'unit_price', oi.unit_price,
                               'total_price', oi.total_price,
                               'fabric_name', f.name
                           )
                       )
                       FROM order_items oi
                       LEFT JOIN fabrics f ON oi.fabric_id = f.fabric_id
                       WHERE oi.order_id = o.order_id
                   ) as items
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE o.order_status = 'PENDING'
            AND o.verified_at IS NULL
            ORDER BY o.order_id, p.payment_date DESC
        `;
        const result = await pool.query(query);
        const orders = result.rows || [];
        
        return {
            count: orders.length,
            orders
        };
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        throw error;
    }
};

const getPendingPayments = async () => {
    try {
        const query = `
            SELECT DISTINCT ON (o.order_id)
                   o.*, 
                   c.full_name as customer_name,
                   c.email as customer_email,
                   p.payment_id,
                   p.payment_status,
                   p.payment_method,
                   p.bank_slip_url,
                   (
                       SELECT JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'order_item_id', oi.order_item_id,
                               'fabric_id', oi.fabric_id,
                               'quantity', oi.quantity,
                               'unit_price', oi.unit_price,
                               'total_price', oi.total_price,
                               'fabric_name', f.name
                           )
                       )
                       FROM order_items oi
                       LEFT JOIN fabrics f ON oi.fabric_id = f.fabric_id
                       WHERE oi.order_id = o.order_id
                   ) as items
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE p.payment_status = 'PENDING' 
               OR (o.order_status IN ('PROCESSING', 'PENDING') AND p.payment_id IS NULL)
            ORDER BY o.order_id, p.payment_date DESC NULLS LAST
        `;
        const result = await pool.query(query);
        const orders = result.rows || [];
        return {
            count: orders.length,
            orders
        };
    } catch (error) {
        console.error('Error fetching pending payments:', error);
        throw error;
    }
};

const verifyOrder = async (orderId, action, verifiedBy, verifierId) => {
    try {
        const newStatus = action === 'approve' ? 'PROCESSING' : 'CANCELLED';

        // Update order with verification info
        const updateQuery = `
            UPDATE orders 
            SET order_status = $1, verified_at = NOW(), verified_by = $2
            WHERE order_id = $3
            RETURNING *
        `;

        const result = await pool.query(updateQuery, [newStatus, verifierId, orderId]);

        // Log the verification activity
        const activityQuery = `
            INSERT INTO activity_logs (employee_id, actor_type, action_type, action)
            VALUES ($1, 'EMPLOYEE', $2, $3)
        `;

        await pool.query(activityQuery, [
            verifierId,
            'ORDER_VERIFICATION',
            `Order #${orderId} ${action}d by ${verifiedBy}`
        ]);

        // Send notification to customer if approved
        if (action === 'approve') {
            try {
                await sendConfirmation(orderId, 'order_confirmation', verifiedBy, verifierId);
            } catch (notifyErr) {
                console.error("Failed to send order verification notification:", notifyErr);
            }
        }

        return { orderId, order_status: newStatus, action };
    } catch (error) {
        console.error('Error verifying order:', error);
        throw error;
    }
};

const sendConfirmation = async (orderId, type, sentBy, senderId, customMessage = null) => {
    try {
        // If orderId is 'all', handle bulk confirmations
        if (orderId === 'all') {
            const bulkQuery = `
                SELECT o.order_id, o.customer_id, c.full_name, c.email, c.tel 
                FROM orders o 
                LEFT JOIN customers c ON o.customer_id = c.customer_id 
                WHERE o.order_status IN ('PROCESSING', 'DELIVERED')
                AND (c.email IS NOT NULL OR c.tel IS NOT NULL)
            `;

            const result = await pool.query(bulkQuery);
            const orders = result.rows || [];

            const confirmationPromises = orders.map(order => {
                return sendSingleConfirmation(order.order_id, type, sentBy, senderId, {
                    customerName: order.full_name,
                    email: order.email,
                    phone: order.tel
                }, customMessage);
            });

            const results = await Promise.all(confirmationPromises);
            return { type, count: results.length, results };
        } else {
            // Single order confirmation
            return await sendSingleConfirmation(orderId, type, sentBy, senderId, null, customMessage);
        }
    } catch (error) {
        console.error('Error sending confirmation:', error);
        throw error;
    }
};

const sendSingleConfirmation = async (orderId, type, sentBy, senderId, customerInfo = null, customMessage = null) => {
    try {
        // Get customer info if not provided
        if (!customerInfo) {
            const customerQuery = `
                SELECT c.full_name, c.email, 
                       c.tel, 
                       o.total_amount, 
                       o.order_status,
                       o.delivered_by,
                       o.delivery_contact_number
                FROM orders o 
                LEFT JOIN customers c ON o.customer_id = c.customer_id 
                WHERE o.order_id = $1
            `;

            const result = await pool.query(customerQuery, [orderId]);
            const customer = result.rows[0];
            if (!customer) throw new Error('Order not found');

            customerInfo = {
                customerName: customer.full_name,
                email: customer.email,
                phone: customer.tel,
                totalAmount: customer.total_amount,
                orderStatus: customer.order_status,
                deliveredBy: customer.delivered_by,
                deliveryContact: customer.delivery_contact_number
            };
        }

        // Create confirmation record
        // Note: DB constraint only allows 'order_confirmation', 'payment_confirmation', 'delivery_update'
        // Map 'payment_rejection' => 'payment_confirmation' with a [REJECTED] prefix in the message
        const dbType = type === 'payment_rejection' ? 'payment_confirmation' : type;
        const confirmationQuery = `
            INSERT INTO confirmation_logs (order_id, confirmation_type, sent_by, recipient_email, recipient_phone, message_content)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const confirmationMessage = customMessage || generateConfirmationMessage(orderId, type, customerInfo);
        const storedMessage = (type === 'payment_rejection' && !customMessage)
            ? '[REJECTED] ' + confirmationMessage
            : confirmationMessage;

        await pool.query(confirmationQuery, [
            orderId,
            dbType,
            senderId,
            customerInfo.email,
            customerInfo.phone,
            storedMessage
        ]);

        // Log the activity
        const activityQuery = `
            INSERT INTO activity_logs (employee_id, actor_type, action_type, action)
            VALUES ($1, 'EMPLOYEE', $2, $3)
        `;

        await pool.query(activityQuery, [
            senderId,
            'NOTIFICATION_SENT',
            `${type} sent for Order #${orderId} by ${sentBy}`
        ]);

        return {
            orderId,
            type,
            message: confirmationMessage,
            sentTo: {
                email: customerInfo.email,
                phone: customerInfo.phone,
                name: customerInfo.customerName
            }
        };
    } catch (error) {
        console.error('Error sending single confirmation:', error);
        throw error;
    }
};

const generateConfirmationMessage = (orderId, type, customerInfo) => {
    const messages = {
        'order_confirmation': `Hello ${customerInfo.customerName}, your order #${orderId} has been confirmed and is being processed. Total amount: Rs. ${customerInfo.totalAmount}. Thank you for shopping with us!`,
        'payment_confirmation': `Dear ${customerInfo.customerName}, we have received your payment for order #${orderId}. Your order will be processed shortly.`,
        'payment_rejection': `Hi ${customerInfo.customerName}, your payment proof for order #${orderId} was not accepted. Please re-upload your bank slip in the 'Order Details' section or contact support.`,
        'delivery_update': customerInfo.orderStatus === 'DELIVERED' 
            ? `Hi ${customerInfo.customerName}, your order #${orderId} has been successfully delivered${customerInfo.deliveredBy ? ' by ' + customerInfo.deliveredBy : ''}${customerInfo.deliveryContact ? ' (Contact: ' + customerInfo.deliveryContact + ')' : ''}. Thank you for shopping with Hiran Fabric Textile! We'd love to hear your feedback.`
            : `Hi ${customerInfo.customerName}, your order #${orderId} order_status has been updated to: ${customerInfo.orderStatus}. We'll keep you informed of any further updates.`
    };

    return messages[type] || `Order #${orderId} update for ${customerInfo.customerName}`;
};

const createCustomer = async ({ full_name, email, tel, address, password }) => {
    try {
        // Check if email already exists
        const existing = await pool.query('SELECT customer_id FROM customers WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            throw new Error('A customer with this email already exists.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO customers (full_name, email, password, tel, address)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING customer_id, full_name, email, tel, address, created_at`,
            [full_name, email, hashedPassword, tel, address]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
};

export {
    getSalesDashboardStats,
    getCustomerStats,
    getPendingVerifications,
    getPendingPayments,
    verifyOrder,
    sendConfirmation,
    createCustomer
};
