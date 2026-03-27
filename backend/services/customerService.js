import { pool } from "../config/db.js";

/**
 * Get statistics for the customer dashboard
 * @param {number} customerId - The ID of the customer
 * @returns {Promise<Object>} - Dashboard statistics
 */
export const getCustomerDashboardStats = async (customerId) => {
    const queries = {
        totalOrders: `
            SELECT COUNT(*) as total FROM orders WHERE customer_id = $1
        `,
        pendingOrders: `
            SELECT COUNT(*) as total FROM orders 
            WHERE customer_id = $1 AND order_status IN ('PENDING', 'PROCESSING')
        `,
        cartItems: `
            SELECT COUNT(*) as total FROM cart WHERE customer_id = $1
        `,
        totalSpent: `
            SELECT SUM(total_amount) as total FROM orders 
            WHERE customer_id = $1 AND order_status = 'DELIVERED'
        `
    };

    const [totalOrders, pendingOrders, cartItems, totalSpent] = await Promise.all([
        pool.query(queries.totalOrders, [customerId]),
        pool.query(queries.pendingOrders, [customerId]),
        pool.query(queries.cartItems, [customerId]),
        pool.query(queries.totalSpent, [customerId])
    ]);

    return {
        totalOrders: parseInt(totalOrders.rows[0]?.total || 0),
        pendingOrders: parseInt(pendingOrders.rows[0]?.total || 0),
        cartItems: parseInt(cartItems.rows[0]?.total || 0),
        totalSpent: parseFloat(totalSpent.rows[0]?.total || 0)
    };
};

/**
 * Get notifications for the customer
 * @param {number} customerId - The ID of the customer
 * @returns {Promise<Array>} - List of notifications
 */
export const getCustomerNotifications = async (customerId) => {
    const query = `
        SELECT cl.*, o.order_id, o.order_status
        FROM confirmation_logs cl
        JOIN orders o ON cl.order_id = o.order_id
        WHERE o.customer_id = $1
        ORDER BY cl.sent_at DESC
    `;
    const result = await pool.query(query, [customerId]);
    return result.rows;
};

/**
 * Submit feedback for a specific order
 * @param {Object} feedbackData - The feedback data (customer_id, order_id, ratings, comments)
 */
export const submitOrderFeedback = async (feedbackData) => {
    const { 
        customerId, 
        orderId, 
        overall_rating, 
        order_experience, 
        fabric_quality, 
        delivery, 
        customer_service, 
        comments 
    } = feedbackData;

    // Helper to ensure 1-5 rating or null
    const normalizeRating = (val) => {
        const num = parseInt(val);
        return (isNaN(num) || num < 1 || num > 5) ? null : num;
    };

    const query = `
        INSERT INTO feedback (
            customer_id, 
            order_id, 
            overall_rating, 
            order_experience, 
            fabric_quality, 
            delivery, 
            customer_service, 
            comments
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

    const result = await pool.query(query, [
        customerId, 
        orderId ? parseInt(orderId) : null, 
        parseInt(overall_rating), 
        normalizeRating(order_experience), 
        normalizeRating(fabric_quality),
        normalizeRating(delivery), 
        normalizeRating(customer_service), 
        comments || null
    ]);

    // Log activity for Sales visibility
    const activityQuery = `
        INSERT INTO activity_logs (customer_id, actor_type, action_type, action)
        VALUES ($1, 'CUSTOMER', $2, $3)
    `;
    const actionDesc = orderId 
        ? `Customer submitted feedback for Order #${orderId} (Rating: ${overall_rating}/5)`
        : `Customer submitted general feedback (Rating: ${overall_rating}/5)`;
    
    try {
        await pool.query(activityQuery, [customerId, 'FEEDBACK_SUBMITTED', actionDesc]);
    } catch (logError) {
        console.error('Error logging feedback activity:', logError);
        // Don't fail the whole request if logging fails
    }

    return result.rows[0];
};

/**
 * Get feedback for a specific order
 * @param {number} customerId - The ID of the customer
 * @param {number} orderId - The ID of the order
 */
export const getOrderFeedback = async (customerId, orderId) => {
    const query = `
        SELECT * FROM feedback 
        WHERE customer_id = $1 AND order_id = $2
    `;
    const result = await pool.query(query, [customerId, orderId]);
    return result.rows[0] || null;
};
