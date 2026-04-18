import { getSalesReport } from './src/services/reportService.js';
import { pool } from './src/config/db.js';

async function test() {
    try {
        console.log('Fetching report...');
        const data = await getSalesReport();
        console.log('Report Summary:', data.summary);
        console.log('Daily Sales Count:', data.dailySales.length);
        if (data.dailySales.length > 0) {
            console.log('First Daily Sale:', data.dailySales[0]);
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

test();
