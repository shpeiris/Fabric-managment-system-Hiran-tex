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
        lowStock: "SELECT name, stock_available_quantity, reorder_level, restock_date FROM fabrics WHERE stock_available_quantity <= reorder_level",
        totalValue: "SELECT SUM(price_per_meter * stock_available_quantity) as total_inventory_value FROM fabrics",
        topSelling: `
      SELECT f.name, SUM(oi.quantity) as total_sold
      FROM order_items oi
      JOIN fabrics f ON oi.fabric_id = f.fabric_id
      GROUP BY f.fabric_id
      ORDER BY total_sold DESC
      LIMIT 5
    `,
        stats: "SELECT COUNT(*) as total_items, SUM(CASE WHEN stock_available_quantity <= reorder_level AND stock_available_quantity > 0 THEN 1 ELSE 0 END) as low_stock_count, SUM(CASE WHEN stock_available_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count, SUM(stock_available_quantity) as total_meters FROM fabrics",
        allFabrics: "SELECT name, material_type, width, stock_available_quantity, price_per_meter, (price_per_meter * stock_available_quantity) as value FROM fabrics ORDER BY name ASC",
        materialDistribution: "SELECT material_type, COUNT(*) as count, SUM(stock_available_quantity) as total_meters FROM fabrics GROUP BY material_type"
    };

    const [lowStock, totalValue, topSelling, stats, allFabrics, materialDistribution] = await Promise.all([
        new Promise((resolve, reject) => pool.query(queries.lowStock, (err, res) => err ? reject(err) : resolve(res))),
        new Promise((resolve, reject) => pool.query(queries.totalValue, (err, res) => err ? reject(err) : resolve(res[0]))),
        new Promise((resolve, reject) => pool.query(queries.topSelling, (err, res) => err ? reject(err) : resolve(res))),
        new Promise((resolve, reject) => pool.query(queries.stats, (err, res) => err ? reject(err) : resolve(res[0]))),
        new Promise((resolve, reject) => pool.query(queries.allFabrics, (err, res) => err ? reject(err) : resolve(res))),
        new Promise((resolve, reject) => pool.query(queries.materialDistribution, (err, res) => err ? reject(err) : resolve(res)))
    ]);

    return {
        lowStock,
        totalValue: totalValue.total_inventory_value || 0,
        topSelling,
        totalItems: stats.total_items || 0,
        lowStockCount: stats.low_stock_count || 0,
        outOfStockCount: stats.out_of_stock_count || 0,
        totalMeters: stats.total_meters || 0,
        allFabrics,
        materialDistribution
    };
};

const getSupplierReport = async () => {
    const queryStr = `
        SELECT 
            s.supplier_id,
            s.name, 
            s.contact_person,
            COUNT(sa.arrival_id) as fulfillment_count, 
            COALESCE(SUM(sa.quantity), 0) as total_quantity, 
            COALESCE(SUM(sa.total_value), 0) as total_value, 
            MAX(sa.arrival_date) as last_arrival
        FROM suppliers s
        LEFT JOIN stock_arrivals sa ON s.supplier_id = sa.supplier_id
        GROUP BY s.supplier_id, s.name, s.contact_person
        ORDER BY total_value DESC
    `;

    const statsQuery = `
        SELECT 
            COUNT(*) as total_suppliers,
            SUM(total_value) as all_time_supply_value,
            (SELECT COUNT(*) FROM stock_arrivals WHERE arrival_date >= CURRENT_DATE - INTERVAL '30 days') as recent_arrivals_count
        FROM (
            SELECT s.supplier_id, COALESCE(SUM(sa.total_value), 0) as total_value
            FROM suppliers s
            LEFT JOIN stock_arrivals sa ON s.supplier_id = sa.supplier_id
            GROUP BY s.supplier_id
        ) sub
    `;

    const recentArrivalsQuery = `
        SELECT sa.*, f.name as fabric_name, s.name as supplier_name
        FROM stock_arrivals sa
        JOIN fabrics f ON sa.fabric_id = f.fabric_id
        JOIN suppliers s ON sa.supplier_id = s.supplier_id
        ORDER BY sa.arrival_date DESC
        LIMIT 10
    `;

    const [suppliers, stats, recentArrivals] = await Promise.all([
        new Promise((resolve, reject) => pool.query(queryStr, (err, res) => err ? reject(err) : resolve(res))),
        new Promise((resolve, reject) => pool.query(statsQuery, (err, res) => err ? reject(err) : resolve(res[0]))),
        new Promise((resolve, reject) => pool.query(recentArrivalsQuery, (err, res) => err ? reject(err) : resolve(res)))
    ]);

    return {
        suppliers,
        stats: {
            totalSuppliers: stats.total_suppliers || 0,
            allTimeSupplyValue: stats.all_time_supply_value || 0,
            recentArrivalsCount: stats.recent_arrivals_count || 0
        },
        recentArrivals
    };
};

export {
    getSalesReport,
    getInventoryReport,
    getSupplierReport
};
