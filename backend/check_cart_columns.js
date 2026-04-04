import { pool } from './config/db.js';

async function checkCartColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'cart'
            ORDER BY ordinal_position;
        `);
        console.log('CART_COLUMNS:', JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCartColumns();
