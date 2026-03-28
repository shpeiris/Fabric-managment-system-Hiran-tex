import { pool } from "../config/db.js";

export const initPaymentModel = async () => {
  const query = `
    DO $$ BEGIN
      CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS payments (
      payment_id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL,
      payment_method VARCHAR(50),
      payment_status payment_status DEFAULT 'PENDING',
      bank_slip_url TEXT,
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      verified_by INTEGER,
      confirmed_by INTEGER,
      confirmation_date TIMESTAMP
    );
  `;
  await pool.query(query);
};
