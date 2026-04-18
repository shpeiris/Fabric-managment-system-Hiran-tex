import { pool } from '../backend/src/config/db.js';

async function checkStock() {
  try {
    const res = await pool.query('SELECT fabric_id, name, stock_quantity, stock_available_quantity FROM fabrics WHERE fabric_id = 4;');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkStock();
