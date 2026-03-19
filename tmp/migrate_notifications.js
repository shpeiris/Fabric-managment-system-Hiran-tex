import { pool } from '../backend/config/db.js';

async function run() {
    try {
        console.log("Running migration...");
        await pool.query(`
            ALTER TABLE confirmation_logs 
            DROP CONSTRAINT IF EXISTS confirmation_logs_confirmation_type_check;
            
            ALTER TABLE confirmation_logs 
            ADD CONSTRAINT confirmation_logs_confirmation_type_check 
            CHECK (confirmation_type IN ('order_confirmation', 'payment_confirmation', 'delivery_update', 'payment_rejection'));
        `);
        console.log("Migration successful: Added 'payment_rejection' to confirmation_logs ✅");
    } catch (err) {
        console.error("Migration failed ❌:", err);
    } finally {
        await pool.end();
        process.exit();
    }
}
run();
