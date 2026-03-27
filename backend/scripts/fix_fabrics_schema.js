import { pool } from "../config/db.js";

async function fixFabricsSchema() {
  try {
    console.log("Fixing 'fabrics' schema...");
    
    // Add missing columns
    await pool.query(`ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS image_url TEXT`);
    await pool.query(`ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS width VARCHAR(50)`);
    await pool.query(`ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS stock_available_quantity DECIMAL(10, 2) DEFAULT 0`);
    
    // Ensure restock_level exists (it was there, but let's be sure)
    await pool.query(`ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS restock_level DECIMAL(10, 2) DEFAULT 50`);

    console.log("Schema fixed successfully ✅");
  } catch (err) {
    console.error("Error fixing schema:", err);
  } finally {
    await pool.end();
  }
}
fixFabricsSchema();
