import { pool } from "../config/db.js";

export const initAuthModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS password_resets (
      reset_id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
