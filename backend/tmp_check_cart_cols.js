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

async function checkCartColumns() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cart'");
    console.log('Cart Columns:', res.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Error checking cart columns:', err);
  } finally {
    await pool.end();
  }
}

checkCartColumns();
