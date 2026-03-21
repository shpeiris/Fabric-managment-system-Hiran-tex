// Script to check columns of the feedback table
import { pool } from "./config/db.js";

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders'
    `);
    console.log("Columns in 'orders' table:");
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
    process.exit(0);
  } catch (error) {
    console.error("Error checking schema:", error);
    process.exit(1);
  }
}

checkSchema();
