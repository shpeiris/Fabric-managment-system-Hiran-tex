import { pool } from "../config/db.js";

export const initConfirmationLogModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS confirmation_logs (
      confirmation_id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      confirmation_type VARCHAR(50) NOT NULL,
      sent_by INTEGER NOT NULL,
      recipient_email VARCHAR(255),
      recipient_phone VARCHAR(20),
      status VARCHAR(20) DEFAULT 'SENT',
      message_content TEXT,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
