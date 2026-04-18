import { pool } from "../config/db.js";

export const initOrderModel = async () => {
  const query = `
    DO $$ BEGIN
      CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS orders (
      order_id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
      customer_name VARCHAR(255),
      phone_number VARCHAR(20),
      delivery_address TEXT,
      delivery_type VARCHAR(100),
      special_instructions TEXT,
      order_status order_status DEFAULT 'PENDING',
      total_amount NUMERIC NOT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      verified_at TIMESTAMP,
      verified_by INTEGER,
      delivered_by VARCHAR(255),
      delivery_contact_number VARCHAR(20),
      tracking_id VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      history_id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      old_status order_status,
      new_status order_status NOT NULL,
      changed_by_name VARCHAR(255),
      changed_by_id INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
