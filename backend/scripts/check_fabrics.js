import { pool } from '../config/db.js';

async function checkData() {
    try {
        const result = await pool.query('SELECT * FROM fabrics;');
        console.log(JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
