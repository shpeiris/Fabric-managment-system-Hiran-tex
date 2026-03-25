import { pool } from './backend/config/db.js';

async function checkSchema() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'fabrics'");
        console.log("Columns in fabrics table:", res.rows.map(c => c.column_name));
        process.exit(0);
    } catch (err) {
        console.error("Error checking schema:", err);
        process.exit(1);
    }
}

checkSchema();
