import { pool } from "../config/db.js";

async function testLog() {
  try {
    const sql = `
      INSERT INTO activity_logs (employee_id, action_type, actor_type, action)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await pool.query(sql, [1, 'SYSTEM_EVENT', 'EMPLOYEE', 'Test Activity Log']);
    console.log("Inserted log:", res.rows[0]);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await pool.end();
  }
}
testLog();
