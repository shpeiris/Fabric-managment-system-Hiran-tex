import { pool } from "../config/db.js";

async function fixPaymentsSlip() {
  try {
    console.log("Fixing 'payments' schema (adding bank_slip_url)...");
    
    // Add missing column
    await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS bank_slip_url TEXT`);

    console.log("Schema fixed successfully ✅");
  } catch (err) {
    console.error("Error fixing schema:", err);
  } finally {
    await pool.end();
  }
}
fixPaymentsSlip();
