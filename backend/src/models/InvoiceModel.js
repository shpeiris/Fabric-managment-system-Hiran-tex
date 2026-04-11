import { pool } from "../config/db.js";

export const initInvoiceModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS invoices (
      invoice_id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      invoice_number VARCHAR(20) UNIQUE,
      status VARCHAR(20) DEFAULT 'ISSUED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
