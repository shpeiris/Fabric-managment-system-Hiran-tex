import { pool } from "../config/db.js";

async function fixCartSchema() {
  try {
    console.log("Fixing 'cart' schema...");
    
    // Add missing columns
    await pool.query(`ALTER TABLE cart ADD COLUMN IF NOT EXISTS total_price NUMERIC(12, 2)`);
    
    // Rename column if needed
    await pool.query(`ALTER TABLE cart RENAME COLUMN created_at TO added_date`);
    
    // Fix quantity type (integer to numeric)
    await pool.query(`ALTER TABLE cart ALTER COLUMN quantity TYPE NUMERIC(10, 2) USING quantity::NUMERIC`);

    console.log("Schema fixed successfully ✅");
  } catch (err) {
    if (err.message.includes("column \"added_date\" already exists")) {
       console.log("Column 'added_date' already exists, skipping rename.");
    } else {
       console.error("Error fixing schema:", err);
    }
  } finally {
    await pool.end();
  }
}
fixCartSchema();
