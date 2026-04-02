import { pool } from "../config/db.js";

export const initOrderItemModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      fabric_id INTEGER NOT NULL REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
      quantity NUMERIC NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC NOT NULL,
      total_price NUMERIC
    );
  `;
  await pool.query(query);
};
