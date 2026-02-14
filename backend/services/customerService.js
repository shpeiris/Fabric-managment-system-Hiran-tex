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
            WHERE customer_id = $1 AND order_status IN ('PENDING', 'PROCESSING', 'SHIPPED')
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
