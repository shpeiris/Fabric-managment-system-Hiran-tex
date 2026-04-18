import { pool } from '../config/db.js';

const getSalesReport = async (startDate, endDate) => {
    let dateFilter = "WHERE o.order_status != 'CANCELLED'";
    const params = [];

    if (startDate && endDate) {
        dateFilter += " AND o.order_date BETWEEN $1 AND $2";
        params.push(startDate, endDate);
    }

    const queries = {
        summary: `
            SELECT 
                COALESCE(SUM(o.total_amount), 0) as total_revenue, 
                COUNT(DISTINCT o.order_id) as total_orders, 
                COALESCE(AVG(o.total_amount), 0) as avg_order_value,
                COUNT(DISTINCT o.customer_id) as unique_customers,
                COALESCE(SUM(oi_sub.items_total), 0) as product_revenue
            FROM orders o
            LEFT JOIN (
                SELECT order_id, SUM(total_price) as items_total 
                FROM order_items 
                GROUP BY order_id
            ) oi_sub ON o.order_id = oi_sub.order_id
            ${dateFilter}
        `,
        dailySales: `
            SELECT 
                DATE(o.order_date) as date, 
                SUM(o.total_amount) as total_sales, 
                COUNT(DISTINCT o.order_id) as order_count,
                SUM(COALESCE(oi_sub.items_total, 0)) as product_sales
            FROM orders o
            LEFT JOIN (
                SELECT order_id, SUM(total_price) as items_total 
                FROM order_items 
                GROUP BY order_id
            ) oi_sub ON o.order_id = oi_sub.order_id
            ${dateFilter}
            GROUP BY DATE(o.order_date) 
            ORDER BY date DESC 
            LIMIT 30
        `,
        detailedOrders: `
            SELECT o.order_id, c.full_name as customer_name, o.total_amount, o.order_status, o.order_date
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            ${dateFilter}
            ORDER BY o.order_date DESC
        `,
        topSelling: `
            SELECT f.name, SUM(oi.quantity) as total_meters, SUM(oi.total_price) as total_revenue
            FROM order_items oi
            JOIN fabrics f ON oi.fabric_id = f.fabric_id
            JOIN orders o ON oi.order_id = o.order_id
            ${dateFilter}
            GROUP BY f.fabric_id, f.name
            ORDER BY total_meters DESC
            LIMIT 10
        `
    };

    const [summary, dailySales, detailedOrders, topSelling] = await Promise.all([
        pool.query(queries.summary, params),
        pool.query(queries.dailySales, params),
        pool.query(queries.detailedOrders, params),
        pool.query(queries.topSelling, params)
    ]);

    const totalRevenue = parseFloat(summary.rows[0]?.total_revenue || 0);
    const productRevenue = parseFloat(summary.rows[0]?.product_revenue || 0);

    return {
        summary: {
            totalRevenue,
            productRevenue,
            deliveryRevenue: totalRevenue - productRevenue,
            totalOrders: parseInt(summary.rows[0]?.total_orders || 0),
            avgOrderValue: parseFloat(summary.rows[0]?.avg_order_value || 0),
            uniqueCustomers: parseInt(summary.rows[0]?.unique_customers || 0)
        },
        dailySales: dailySales.rows.map(row => ({
            ...row,
            total_sales: parseFloat(row.total_sales),
            product_sales: parseFloat(row.product_sales),
            delivery_sales: parseFloat(row.total_sales) - parseFloat(row.product_sales)
        })),
        detailedOrders: detailedOrders.rows,
        topSelling: topSelling.rows
    };
};

const getInventoryReport = async (startDate, endDate) => {
    let dateFilter = "";
    let orderDateFilter = "";
    const params = [];

    if (startDate && endDate) {
        dateFilter = " AND arrival_date BETWEEN $1 AND $2";
        orderDateFilter = " JOIN orders o ON oi.order_id = o.order_id WHERE o.order_status != 'CANCELLED' AND o.order_date BETWEEN $1 AND $2";
        params.push(startDate, endDate);
    }

    const queries = {
        lowStock: "SELECT * FROM fabrics WHERE stock_available_quantity <= restock_level ORDER BY stock_available_quantity ASC",
        totalValue: "SELECT SUM(stock_available_quantity * price_per_meter) as total_inventory_value FROM fabrics",
        topSelling: `
            SELECT f.name, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN fabrics f ON oi.fabric_id = f.fabric_id
            ${orderDateFilter}
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
            WHERE 1=1 ${dateFilter}
            ORDER BY sa.arrival_date DESC
        `
    };

    const [lowStock, totalValue, topSelling, stats, allFabrics, recentArrivals] = await Promise.all([
        pool.query(queries.lowStock),
        pool.query(queries.totalValue),
        pool.query(queries.topSelling, params),
        pool.query(queries.stats),
        pool.query(queries.allFabrics),
        pool.query(queries.recentArrivals, params)
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

const getSupplierReport = async (startDate, endDate) => {
    let dateFilter = "";
    const params = [];

    if (startDate && endDate) {
        dateFilter = " AND arrival_date BETWEEN $1 AND $2";
        params.push(startDate, endDate);
    }

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
        LEFT JOIN stock_arrivals sa ON s.supplier_id = sa.supplier_id ${dateFilter}
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
            LEFT JOIN stock_arrivals sa ON s.supplier_id = sa.supplier_id ${dateFilter}
            GROUP BY s.supplier_id
        ) sub
    `;

    const recentArrivalsQuery = `
        SELECT sa.*, f.name as fabric_name, s.name as supplier_name
        FROM stock_arrivals sa
        JOIN fabrics f ON sa.fabric_id = f.fabric_id
        JOIN suppliers s ON sa.supplier_id = s.supplier_id
        WHERE 1=1 ${dateFilter}
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
