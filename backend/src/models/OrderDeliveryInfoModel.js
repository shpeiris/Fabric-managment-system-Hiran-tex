import { pool } from "../config/db.js";

export const initOrderDeliveryInfoModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS order_delivery_info (
      delivery_id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      delivery_type_id INTEGER NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_phone VARCHAR(20),
      delivery_contact_name VARCHAR(255),
      estimated_delivery_date DATE,
      actual_delivery_date DATE,
      delivery_instructions TEXT,
      tracking_number VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
