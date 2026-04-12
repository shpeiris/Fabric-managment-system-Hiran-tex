import { pool } from '../config/db.js';

/**
 * Generate an official invoice for an order.
 * If an invoice already exists, returns the existing one.
 */
const generateInvoice = async (orderId) => {
    try {
        // 1. Check if invoice already exists
        const existing = await pool.query(
            "SELECT * FROM invoices WHERE order_id = $1",
            [orderId]
        );

        if (existing.rows.length > 0) {
            return existing.rows[0];
        }

        // 2. Insert new invoice record
        await pool.query('BEGIN');
        
        const insertRes = await pool.query(
            "INSERT INTO invoices (order_id, status) VALUES ($1, 'ISSUED') RETURNING *",
            [orderId]
        );
        
        await pool.query('COMMIT');
        return insertRes.rows[0];
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error generating invoice:', error);
        throw error;
    }
};

const getInvoices = async () => {
    try {
        const query = `
            SELECT i.*, o.total_amount, o.order_date,
                   c.full_name as customer_name,
                   c.email as customer_email
            FROM invoices i
            JOIN orders o ON i.order_id = o.order_id
            JOIN customers c ON o.customer_id = c.customer_id
            ORDER BY i.created_at DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

const getInvoiceByOrderId = async (orderId) => {
    try {
        const result = await pool.query(
            "SELECT * FROM invoices WHERE order_id = $1",
            [orderId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching invoice by order ID:', error);
        throw error;
    }
};

export default {
    generateInvoice,
    getInvoices,
    getInvoiceByOrderId
};
