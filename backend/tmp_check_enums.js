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

async function checkEnumValues() {
  try {
    const res = await pool.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'order_status'");
    console.log('Order Status Enum Labels:', res.rows.map(r => r.enumlabel));
    
    const res2 = await pool.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'payment_status'");
    console.log('Payment Status Enum Labels:', res2.rows.map(r => r.enumlabel));
  } catch (err) {
    console.error('Error checking enum values:', err);
  } finally {
    await pool.end();
  }
}

checkEnumValues();
