import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "fabric_management_system",
  port: process.env.DB_PORT || 5432,
});

async function createTestCustomer() {
  const password = 'Password123';
  const hashedPassword = await bcrypt.hash(password, 10);
  const email = 'testcustomer@example.com';
  
  try {
    // Check if user exists
    const check = await pool.query("SELECT * FROM customers WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      console.log('User already exists');
      return;
    }

    const res = await pool.query(
      "INSERT INTO customers (full_name, email, password, tel, address) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      ['Test Customer', email, hashedPassword, '0712345678', '123, Test Lane, Colombo']
    );
    console.log('Customer Created:', res.rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
  } finally {
    await pool.end();
  }
}

createTestCustomer();
