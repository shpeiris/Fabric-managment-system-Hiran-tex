import { pool } from "../src/config/db.js";

async function fixPaymentsSchema() {
  try {
    console.log("Fixing 'payments' schema...");
    
    // Rename columns to match code expectations
    try {
        await pool.query(`ALTER TABLE payments RENAME COLUMN method TO payment_method`);
    } catch (_) { /* maybe already renamed */ }
    
    try {
        await pool.query(`ALTER TABLE payments RENAME COLUMN status TO payment_status`);
    } catch (_) { /* maybe already renamed */ }

    console.log("Schema fixed successfully ✅");
  } catch (err) {
    console.error("Error fixing schema:", err);
  } finally {
    await pool.end();
  }
}
fixPaymentsSchema();
