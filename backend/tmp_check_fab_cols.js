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

async function checkFabricsColumns() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'fabrics'");
    console.log('Fabrics Columns:', res.rows.map(r => r.column_name));
  } catch (err) {
    console.error('Error checking fabrics columns:', err);
  } finally {
    await pool.end();
  }
}

checkFabricsColumns();
