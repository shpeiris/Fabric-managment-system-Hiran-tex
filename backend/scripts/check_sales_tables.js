import { pool } from "../config/db.js";

async function check() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:");
    res.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Check specific table columns if they exist
    const tablesToCheck = ['confirmation_logs', 'order_statuses', 'customer_contacts'];
    for (const table of tablesToCheck) {
      if (res.rows.some(r => r.table_name === table)) {
        const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
        console.log(`\nColumns in '${table}':`);
        cols.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
      } else {
        console.log(`\nTable '${table}' does NOT exist.`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();
