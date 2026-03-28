import { pool } from "../config/db.js";

export const initSupplierModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS suppliers (
      supplier_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255),
      contact_number VARCHAR(20),
      email VARCHAR(255),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
