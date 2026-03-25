import { pool } from "../config/db.js";

async function fixOrdersSchema() {
  try {
    console.log("Fixing 'orders' and 'order_items' schema...");
    
    // Fix orders table
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(100)`);
    
    // Fix order_items table
    // Rename price_at_purchase to unit_price if it exists
    try {
        await pool.query(`ALTER TABLE order_items RENAME COLUMN price_at_purchase TO unit_price`);
    } catch (_) { /* maybe already renamed or doesn't exist */ }
    
    await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12, 2)`);
    await pool.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(12, 2)`);
    
    // Fix quantity type
    await pool.query(`ALTER TABLE order_items ALTER COLUMN quantity TYPE NUMERIC(12, 2) USING quantity::NUMERIC`);

    console.log("Schema fixed successfully ✅");
  } catch (err) {
    console.error("Error fixing schema:", err);
  } finally {
    await pool.end();
  }
}
fixOrdersSchema();
