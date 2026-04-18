import { pool } from "./src/config/db.js";

async function checkFabrics() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'fabrics'");
    console.table(res.rows);
  } catch (err) {
    console.error("Error checking fabrics table:", err);
  } finally {
    process.exit();
  }
}

checkFabrics();
