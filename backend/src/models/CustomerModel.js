import { pool } from "../config/db.js";

export const initCustomerModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS customers (
      customer_id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      tel VARCHAR(20) NOT NULL,
      address TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Defensive: Ensure existing tables are expanded
    DO $$ 
    BEGIN 
      ALTER TABLE customers ALTER COLUMN email TYPE VARCHAR(255);
      ALTER TABLE customers ALTER COLUMN password TYPE VARCHAR(255);
      ALTER TABLE customers ALTER COLUMN tel TYPE VARCHAR(20);
      ALTER TABLE customers ALTER COLUMN address TYPE TEXT;
    EXCEPTION WHEN OTHERS THEN 
      RAISE NOTICE 'Customer table already expanded or busy.';
    END $$;
  `;
  await pool.query(query);
};
