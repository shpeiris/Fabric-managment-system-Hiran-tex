import { pool } from '../config/db.js';

const getSalesReport = async (startDate, endDate) => {
    return new Promise((resolve, reject) => {
        let query = `
      SELECT DATE(order_date) as date, SUM(total_amount) as total_sales, COUNT(*) as order_count
      FROM orders 
      WHERE order_status != 'CANCELLED'
    `;
        const params = [];

        if (startDate && endDate) {
            query += " AND order_date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        }

        query += " GROUP BY DATE(order_date) ORDER BY date DESC LIMIT 30";

        pool.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getInventoryReport = async () => {
    const queries = {
        lowStock: "SELECT name, stock_quantity, restock_level, restock_date FROM fabrics WHERE stock_quantity <= restock_level",
        totalValue: "SELECT SUM(price_per_meter * stock_available_quantity) as total_inventory_value FROM fabrics",
        topSelling: `
      SELECT f.name, SUM(oi.quantity) as total_sold
      FROM order_items oi
      JOIN fabrics f ON oi.fabric_id = f.fabric_id
      GROUP BY f.fabric_id
      ORDER BY total_sold DESC
      LIMIT 5
    `
    };

    const [lowStock, totalValue, topSelling] = await Promise.all([
        new Promise((resolve, reject) => pool.query(queries.lowStock, (err, res) => err ? reject(err) : resolve(res))),
        new Promise((resolve, reject) => pool.query(queries.totalValue, (err, res) => err ? reject(err) : resolve(res[0]))),
        new Promise((resolve, reject) => pool.query(queries.topSelling, (err, res) => err ? reject(err) : resolve(res)))
    ]);

    return {
        lowStock,
        totalValue: totalValue.total_inventory_value || 0,
        topSelling
    };
};

export {
    getSalesReport,
    getInventoryReport
};
