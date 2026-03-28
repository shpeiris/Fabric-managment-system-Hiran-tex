import { pool } from "../config/db.js";

export const initCartModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS cart (
      cart_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
      fabric_id INTEGER NOT NULL REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
      quantity NUMERIC DEFAULT 1 CHECK (quantity > 0),
      total_price NUMERIC,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
