import { pool } from "../config/db.js";

export const initActivityLogModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS activity_logs (
      log_id SERIAL PRIMARY KEY,
      employee_id INTEGER,
      customer_id INTEGER,
      actor_id INTEGER,
      actor_type VARCHAR(50),
      action_type VARCHAR(50),
      action VARCHAR(255) NOT NULL,
      details TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
