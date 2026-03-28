import { pool } from "../config/db.js";

export const initPaymentMethodModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS payment_methods (
      method_id SERIAL PRIMARY KEY,
      method_name VARCHAR(50) NOT NULL,
      description TEXT,
      requires_verification BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true
    );
  `;
  await pool.query(query);

  const paymentCheck = await pool.query("SELECT COUNT(*) FROM payment_methods");
  if (parseInt(paymentCheck.rows[0].count) === 0) {
    console.log("🌱 Seeding payment methods...");
    await pool.query(`
      INSERT INTO payment_methods (method_name, description, requires_verification) VALUES
      ('Bank Transfer', 'Manual verification of bank slip required', true),
      ('Cash on Delivery', 'Pay when receiving the package', false),
      ('Card Payment', 'Instant online payment', false);
    `);
  }
};
