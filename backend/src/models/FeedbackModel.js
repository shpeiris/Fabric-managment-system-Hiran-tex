import { pool } from "../config/db.js";

export const initFeedbackModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS feedback (
      feedback_id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
      order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
      overall_rating INTEGER NOT NULL,
      fabric_quality INTEGER,
      delivery INTEGER,
      customer_service INTEGER,
      order_experience INTEGER,
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
