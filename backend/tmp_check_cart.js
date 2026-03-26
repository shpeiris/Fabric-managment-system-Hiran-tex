import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "fabric_management_system",
  port: process.env.DB_PORT || 5432,
});

async function checkCart() {
  const email = 'testcustomer@example.com';
  try {
    const userRes = await pool.query("SELECT customer_id FROM customers WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const customerId = userRes.rows[0].customer_id;
    const cartRes = await pool.query("SELECT * FROM cart WHERE customer_id = $1", [customerId]);
    console.log('Cart Items for', email, ':', cartRes.rows.length);
  } catch (err) {
    console.error('Error checking cart:', err);
  } finally {
    await pool.end();
  }
}

checkCart();
