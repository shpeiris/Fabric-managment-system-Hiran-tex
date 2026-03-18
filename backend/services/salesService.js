import { pool } from '../config/db.js';

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
        totalCustomers: "SELECT COUNT(*) as total FROM customers WHERE status = 'ACTIVE'",
        pendingOrders: `
            SELECT COUNT(*) as total 
            FROM orders 
            WHERE order_status IN ('PENDING', 'PROCESSING')
        `,
        recentOrders: `
            SELECT o.order_id, o.customer_id, o.total_amount, o.order_date,
                   o.order_status,
                   c.full_name as customer_name,
                   c.tel as phone_number,
                   p.payment_status,
                   p.payment_id,
                   p.payment_method,
                   p.bank_slip_url
            FROM orders o 
            LEFT JOIN customers c ON o.customer_id = c.customer_id 
            LEFT JOIN payments p ON o.order_id = p.order_id
            ORDER BY o.order_date DESC LIMIT 5
        `
    };

    try {
        const [totalSales, monthlySales, customers, pending, recentOrders] = await Promise.all([
            pool.query(queries.totalSales),
            pool.query(queries.monthlySales),
            pool.query(queries.totalCustomers),
            pool.query(queries.pendingOrders),
            pool.query(queries.recentOrders)
        ]);

        return {
            stats: {
                totalSales: parseFloat(totalSales.rows[0]?.total || 0),
                monthlySales: parseFloat(monthlySales.rows[0]?.total || 0),
                totalCustomers: parseInt(customers.rows[0]?.total || 0),
                pendingOrders: parseInt(pending.rows[0]?.total || 0)
            },
            recentOrders: recentOrders.rows || []
        };
    } catch (error) {
        console.error('Error fetching sales dashboard stats:', error);
        throw error;
    }
};

const getCustomerStats = async () => {
    try {
        const query = `
            SELECT c.customer_id, c.full_name, c.email, c.registration_date,
                   cc_phone.contact_value as phone,
                   COUNT(DISTINCT o.order_id) as total_orders,
                   COALESCE(SUM(o.total_amount), 0) as total_spent
            FROM customers c
            LEFT JOIN customer_contacts cc_phone ON c.customer_id = cc_phone.customer_id 
                AND cc_phone.contact_type = 'PHONE' AND cc_phone.is_primary = TRUE
            LEFT JOIN orders o ON c.customer_id = o.customer_id
            WHERE c.status = 'ACTIVE'
            GROUP BY c.customer_id, c.full_name, c.email, c.registration_date, cc_phone.contact_value
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
                   p.bank_slip_url,
                   p.payment_status,
                   p.payment_method
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
                   p.payment_id,
                   p.payment_status,
                   p.payment_method,
                   p.bank_slip_url
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

        return { orderId, status: newStatus, action };
    } catch (error) {
        console.error('Error verifying order:', error);
        throw error;
    }
};

const sendConfirmation = async (orderId, type, sentBy, senderId) => {
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
                });
            });

            const results = await Promise.all(confirmationPromises);
            return { type, count: results.length, results };
        } else {
            // Single order confirmation
            return await sendSingleConfirmation(orderId, type, sentBy, senderId);
        }
    } catch (error) {
        console.error('Error sending confirmation:', error);
        throw error;
    }
};

const sendSingleConfirmation = async (orderId, type, sentBy, senderId, customerInfo = null) => {
    try {
        // Get customer info if not provided
        if (!customerInfo) {
            const customerQuery = `
                SELECT c.full_name, c.email, 
                       cc.contact_value as tel, 
                       o.total_amount, 
                       os.status_name as order_status
                FROM orders o 
                LEFT JOIN customers c ON o.customer_id = c.customer_id 
                LEFT JOIN customer_contacts cc ON c.customer_id = cc.customer_id 
                    AND cc.contact_type = 'PHONE' AND cc.is_primary = TRUE
                LEFT JOIN order_statuses os ON o.status_id = os.status_id
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
                orderStatus: customer.order_status
            };
        }

        // Create confirmation record
        const confirmationQuery = `
            INSERT INTO confirmation_logs (order_id, confirmation_type, sent_by, recipient_email, recipient_phone, message_content)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const confirmationMessage = generateConfirmationMessage(orderId, type, customerInfo);

        await pool.query(confirmationQuery, [
            orderId,
            type,
            senderId,
            customerInfo.email,
            customerInfo.phone,
            confirmationMessage
        ]);

        // Log the activity
        const activityQuery = `
            INSERT INTO activity_logs (employee_id, actor_type, action_type, action)
            VALUES ($1, 'EMPLOYEE', $2, $3)
        `;

        await pool.query(activityQuery, [
            senderId,
            'CONFIRMATION_SENT',
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
        'delivery_update': `Hi ${customerInfo.customerName}, your order #${orderId} status has been updated to: ${customerInfo.orderStatus}. We'll keep you informed of any further updates.`
    };

    return messages[type] || `Order #${orderId} update for ${customerInfo.customerName}`;
};

export {
    getSalesDashboardStats,
    getCustomerStats,
    getPendingVerifications,
    getPendingPayments,
    verifyOrder,
    sendConfirmation
};
