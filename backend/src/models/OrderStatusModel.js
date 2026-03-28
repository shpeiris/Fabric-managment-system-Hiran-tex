import { pool } from "../config/db.js";

export const initOrderStatusModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS order_statuses (
      status_id SERIAL PRIMARY KEY,
      status_name VARCHAR(50) NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true
    );
  `;
  await pool.query(query);

  const statusCheck = await pool.query("SELECT COUNT(*) FROM order_statuses");
  if (parseInt(statusCheck.rows[0].count) === 0) {
    console.log(" Seeding order statuses...");
    await pool.query(`
      INSERT INTO order_statuses (status_name, description, sort_order) VALUES
      ('PENDING', 'Waiting for payment/verification', 1),
      ('PROCESSING', 'Order is being prepared', 2),
      ('SHIPPED', 'Order is out for delivery', 3),
      ('DELIVERED', 'Customer received the items', 4),
      ('CANCELLED', 'Order has been terminated', 5);
    `);
  }
};
