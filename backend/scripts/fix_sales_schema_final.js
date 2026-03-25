import { pool } from "../config/db.js";

async function fixSalesSchema() {
  try {
    console.log("Applying final schema fixes for Salesperson flow...");
    
    // Fix orders table
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS verified_by INTEGER`);
    
    // Fix payments table
    await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmed_by INTEGER`);
    await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS confirmation_date TIMESTAMP`);
    
    // Fix activity_logs table
    await pool.query(`ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS employee_id INTEGER`);

    console.log("Schema fixed successfully ✅");
  } catch (err) {
    console.error("Error fixing schema:", err);
  } finally {
    await pool.end();
  }
}
fixSalesSchema();
