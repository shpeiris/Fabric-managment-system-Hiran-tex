import { pool } from "../config/db.js";

const getDashboardStats = async (req, res) => {
  try {
    const [
      usersResult,
      customersResult,
      ordersResult,
      revenueResult,
      lowStockResult,
    ] = await Promise.all([
      // Active employees
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'ACTIVE') AS active FROM employees`),
      // Total customers
      pool.query(`SELECT COUNT(*) AS total FROM customers`),
      // Orders by status
      pool.query(`
        SELECT 
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE order_status = 'PENDING')    AS pending,
          COUNT(*) FILTER (WHERE order_status = 'PROCESSING') AS processing,
          COUNT(*) FILTER (WHERE order_status = 'DELIVERED')  AS delivered,
          COUNT(*) FILTER (WHERE order_status = 'CANCELLED')  AS cancelled
        FROM orders
      `),
      // Total revenue from completed payments
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'COMPLETED'`),
      // Low stock fabrics (below restock_level)
      pool.query(`
        SELECT fabric_id, name, stock_quantity, restock_level, color, material_type
        FROM fabrics
        WHERE stock_quantity <= restock_level
        ORDER BY stock_quantity ASC
        LIMIT 10
      `),
    ]);

    res.json({
      employees: {
        total: parseInt(usersResult.rows[0].total),
        active: parseInt(usersResult.rows[0].active),
      },
      customers: {
        total: parseInt(customersResult.rows[0].total),
      },
      orders: {
        total:      parseInt(ordersResult.rows[0].total),
        pending:    parseInt(ordersResult.rows[0].pending),
        processing: parseInt(ordersResult.rows[0].processing),
        delivered:  parseInt(ordersResult.rows[0].delivered),
        cancelled:  parseInt(ordersResult.rows[0].cancelled),
      },
      revenue: {
        total: parseFloat(revenueResult.rows[0].total),
      },
      lowStockFabrics: lowStockResult.rows,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export { getDashboardStats };
