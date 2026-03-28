import { pool } from "../src/config/db.js";

async function fixTypes() {
  try {
    console.log("Fixing 'fabrics' numeric types...");
    
    // Convert integer columns to numeric/decimal
    await pool.query(`ALTER TABLE fabrics ALTER COLUMN stock_quantity TYPE NUMERIC(10, 2) USING stock_quantity::NUMERIC`);
    await pool.query(`ALTER TABLE fabrics ALTER COLUMN restock_level TYPE NUMERIC(10, 2) USING restock_level::NUMERIC`);
    await pool.query(`ALTER TABLE fabrics ALTER COLUMN stock_available_quantity TYPE NUMERIC(10, 2) USING stock_available_quantity::NUMERIC`);

    console.log("Types fixed successfully ✅");
  } catch (err) {
    console.error("Error fixing types:", err);
  } finally {
    await pool.end();
  }
}
fixTypes();
