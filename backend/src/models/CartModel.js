import { pool } from "../config/db.js";

export const initCartModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS cart (
      cart_id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
      fabric_id INTEGER NOT NULL REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
      quantity NUMERIC DEFAULT 1 CHECK (quantity > 0),
      total_price NUMERIC,
      added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Ensure schema consistency if the table was already created with wrong names
    DO $$ 
    BEGIN 
      -- Fix user_id -> customer_id
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cart' AND column_name='user_id') THEN
        ALTER TABLE cart RENAME COLUMN user_id TO customer_id;
      END IF;
      -- Fix created_at -> added_date
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cart' AND column_name='created_at') THEN
        ALTER TABLE cart RENAME COLUMN created_at TO added_date;
      END IF;
    END $$;
  `;
  await pool.query(query);
};
