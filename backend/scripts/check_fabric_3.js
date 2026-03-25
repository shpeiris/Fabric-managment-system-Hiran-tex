import { pool } from "../config/db.js";

async function checkFabric() {
  try {
    const res = await pool.query('SELECT fabric_id, name, stock_quantity, stock_available_quantity FROM fabrics WHERE fabric_id = 3');
    console.log("Fabric ID 3 Info:");
    console.log(res.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkFabric();
