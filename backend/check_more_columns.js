import { pool } from './config/db.js';

async function checkRestOfColumns() {
    try {
        const logsRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'activity_logs'
            ORDER BY ordinal_position;
        `);
        console.log('ACTIVITY_LOGS_COLUMNS:', JSON.stringify(logsRes.rows, null, 2));

        const ordersRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders'
            ORDER BY ordinal_position;
        `);
        console.log('ORDERS_COLUMNS:', JSON.stringify(ordersRes.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRestOfColumns();
