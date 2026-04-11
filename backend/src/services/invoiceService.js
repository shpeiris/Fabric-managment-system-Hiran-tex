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
        // We'll insert first to get the SERIAL id, then update the invoice_number
        // This ensures the number accurately reflects the DB identity
        await pool.query('BEGIN');
        
        const insertRes = await pool.query(
            "INSERT INTO invoices (order_id, status) VALUES ($1, 'ISSUED') RETURNING invoice_id",
            [orderId]
        );
        
        const invoiceId = insertRes.rows[0].invoice_id;
        const formattedNumber = `inv ${invoiceId.toString().padStart(4, '0')}`;
        
        const finalRes = await pool.query(
            "UPDATE invoices SET invoice_number = $1 WHERE invoice_id = $2 RETURNING *",
            [formattedNumber, invoiceId]
        );
        
        await pool.query('COMMIT');
        return finalRes.rows[0];
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
