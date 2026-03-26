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

async function checkOrdersSchema() {
  try {
    const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'orders'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error checking orders schema:', err);
  } finally {
    await pool.end();
  }
}

checkOrdersSchema();
