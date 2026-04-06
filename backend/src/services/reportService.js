import { pool } from '../config/db.js';

const getSalesReport = async (startDate, endDate) => {
    let dateFilter = "WHERE order_status != 'CANCELLED'";
    const params = [];

    if (startDate && endDate) {
        dateFilter += " AND order_date BETWEEN $1 AND $2";
        params.push(startDate, endDate);
    }

    const queries = {
        summary: `
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_revenue, 
                COUNT(*) as total_orders, 
                COALESCE(AVG(total_amount), 0) as avg_order_value,
                COUNT(DISTINCT customer_id) as unique_customers
            FROM orders 
            ${dateFilter}
        `,
        dailySales: `
            SELECT DATE(order_date) as date, SUM(total_amount) as total_sales, COUNT(*) as order_count
            FROM orders 
            ${dateFilter}
            GROUP BY DATE(order_date) 
            ORDER BY date DESC 
            LIMIT 30
        `,
        monthlyOrders: `
            SELECT o.order_id, u.full_name as customer_name, o.total_amount, o.order_status, o.order_date
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            WHERE o.order_status != 'CANCELLED' 
            AND o.order_date >= DATE_TRUNC('month', CURRENT_DATE)
            ORDER BY o.order_date DESC
        `
    };

    const [summary, dailySales, monthlyOrders] = await Promise.all([
        pool.query(queries.summary, params),
        pool.query(queries.dailySales, params),
        pool.query(queries.monthlyOrders, params)
    ]);

    return {
        summary: {
            totalRevenue: parseFloat(summary.rows[0]?.total_revenue || 0),
            totalOrders: parseInt(summary.rows[0]?.total_orders || 0),
            avgOrderValue: parseFloat(summary.rows[0]?.avg_order_value || 0),
            uniqueCustomers: parseInt(summary.rows[0]?.unique_customers || 0)
        },
        dailySales: dailySales.rows,
        monthlyOrders: monthlyOrders.rows
    };
};

const getInventoryReport = async () => {
    const queries = {
        lowStock: "SELECT * FROM fabrics WHERE stock_available_quantity <= restock_level ORDER BY stock_available_quantity ASC",
        totalValue: "SELECT SUM(stock_available_quantity * price_per_meter) as total_inventory_value FROM fabrics",
        topSelling: `
            SELECT f.name, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN fabrics f ON oi.fabric_id = f.fabric_id
            GROUP BY f.fabric_id, f.name
            ORDER BY total_sold DESC
            LIMIT 5
        `,
        stats: `
            SELECT 
                COUNT(*) as total_items,
                COUNT(CASE WHEN stock_available_quantity <= restock_level AND stock_available_quantity > 0 THEN 1 END) as low_stock_count,
                COUNT(CASE WHEN stock_available_quantity = 0 THEN 1 END) as out_of_stock_count,
                SUM(stock_available_quantity) as total_meters 
            FROM fabrics
        `,
        allFabrics: `
            SELECT 
                f.fabric_id, f.name, f.material_type, f.width, f.stock_available_quantity, f.price_per_meter, 
                (f.price_per_meter * f.stock_available_quantity) as value,
                s.name as supplier_name
            FROM fabrics f
            LEFT JOIN (
                SELECT DISTINCT ON (fabric_id) fabric_id, supplier_id 
                FROM stock_arrivals 
                ORDER BY fabric_id, arrival_date DESC
            ) latest_arrival ON f.fabric_id = latest_arrival.fabric_id
            LEFT JOIN suppliers s ON latest_arrival.supplier_id = s.supplier_id
            ORDER BY f.name ASC
        `,
        recentArrivals: `
            SELECT sa.*, f.name as fabric_name, f.material_type, f.color, f.design, s.name as supplier_name, e.full_name as received_by_name
            FROM stock_arrivals sa
            JOIN fabrics f ON sa.fabric_id = f.fabric_id
            JOIN suppliers s ON sa.supplier_id = s.supplier_id
            LEFT JOIN employees e ON sa.received_by = e.employee_id
            ORDER BY sa.arrival_date DESC
        `
    };

    const [lowStock, totalValue, topSelling, stats, allFabrics, recentArrivals] = await Promise.all([
        pool.query(queries.lowStock),
        pool.query(queries.totalValue),
        pool.query(queries.topSelling),
        pool.query(queries.stats),
        pool.query(queries.allFabrics),
        pool.query(queries.recentArrivals)
    ]);

    return {
        lowStock: lowStock.rows,
        totalValue: parseFloat(totalValue.rows[0]?.total_inventory_value || 0),
        topSelling: topSelling.rows,
        totalItems: parseInt(stats.rows[0]?.total_items || 0),
        lowStockCount: parseInt(stats.rows[0]?.low_stock_count || 0),
        outOfStockCount: parseInt(stats.rows[0]?.out_of_stock_count || 0),
        totalMeters: parseFloat(stats.rows[0]?.total_meters || 0),
        allFabrics: allFabrics.rows,
        recentArrivals: recentArrivals.rows
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
        pool.query(queryStr),
        pool.query(statsQuery),
        pool.query(recentArrivalsQuery)
    ]);

    return {
        suppliers: suppliers.rows,
        stats: {
            totalSuppliers: parseInt(stats.rows[0]?.total_suppliers || 0),
            allTimeSupplyValue: parseFloat(stats.rows[0]?.all_time_supply_value || 0),
            recentArrivalsCount: parseInt(stats.rows[0]?.recent_arrivals_count || 0)
        },
        recentArrivals: recentArrivals.rows
    };
};

export {
    getSalesReport,
    getInventoryReport,
    getSupplierReport
};
