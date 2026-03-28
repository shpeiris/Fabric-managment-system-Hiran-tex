import { pool } from "../config/db.js";

export const initDeliveryTypeModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS delivery_types (
      delivery_type_id SERIAL PRIMARY KEY,
      type_name VARCHAR(50) NOT NULL,
      description TEXT,
      base_cost NUMERIC DEFAULT 0,
      estimated_days INTEGER DEFAULT 3,
      is_active BOOLEAN DEFAULT true
    );
  `;
  await pool.query(query);

  const deliveryCheck = await pool.query("SELECT COUNT(*) FROM delivery_types");
  if (parseInt(deliveryCheck.rows[0].count) === 0) {
    console.log("🌱 Seeding delivery types...");
    await pool.query(`
      INSERT INTO delivery_types (type_name, description, base_cost, estimated_days) VALUES
      ('Standard Delivery', '3-5 business days', 350.00, 5),
      ('Express Delivery', '1-2 business days', 750.00, 2),
      ('Store Pickup', 'Collect from our main branch', 0.00, 1);
    `);
  }
};
