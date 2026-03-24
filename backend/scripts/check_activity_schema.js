import { pool } from "../config/db.js";

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activity_logs'
    `);
    console.log("Columns in 'activity_logs':");
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
