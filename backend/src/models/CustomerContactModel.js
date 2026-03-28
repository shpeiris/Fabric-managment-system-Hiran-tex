import { pool } from "../config/db.js";

export const initCustomerContactModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS customer_contacts (
      contact_id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
      contact_type VARCHAR(20) NOT NULL,
      contact_value TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      label VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
