import { pool } from "../config/db.js";

async function checkData() {
  try {
    const res = await pool.query(`SELECT * FROM activity_logs LIMIT 5`);
    console.log("Sample data from 'activity_logs':");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
checkData();
