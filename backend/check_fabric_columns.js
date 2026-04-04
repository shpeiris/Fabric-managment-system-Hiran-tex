import { pool } from './config/db.js';

async function checkFabricColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'fabrics'
            ORDER BY ordinal_position;
        `);
        console.log('FABRIC_COLUMNS:', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkFabricColumns();
