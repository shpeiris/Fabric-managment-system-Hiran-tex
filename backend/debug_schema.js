import { pool } from './config/db.js';

const checkTables = async () => {
    const tables = ['cart', 'orders', 'feedback', 'payments'];
    try {
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);
            
            console.log(`\nCurrent ${table} table schema:`);
            res.rows.forEach(row => {
                console.log(`- ${row.column_name} (${row.data_type})`);
            });
        }
    } catch (err) {
        console.error("Error checking tables:", err);
    } finally {
        await pool.end();
    }
};

checkTables();
