import { pool } from "../config/db.js";

async function fixSchema() {
  try {
    console.log("Fixing 'activity_logs' schema...");
    
    // 1. Drop old/unused columns that are not in schema.sql
    await pool.query(`ALTER TABLE activity_logs DROP COLUMN IF EXISTS details`);
    await pool.query(`ALTER TABLE activity_logs DROP COLUMN IF EXISTS actor_id`);
    await pool.query(`ALTER TABLE activity_logs DROP COLUMN IF EXISTS ip_address`);
    await pool.query(`ALTER TABLE activity_logs DROP COLUMN IF EXISTS user_agent`);
    await pool.query(`ALTER TABLE activity_logs DROP COLUMN IF EXISTS actor_type`); // This one IS in schema.sql, let's keep it or re-add it correctly.
    
    // 2. Add missing columns from schema.sql
    await pool.query(`ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL`);
    await pool.query(`ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS action_type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM_EVENT'`);
    await pool.query(`ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS actor_type VARCHAR(50)`);

    console.log("Adding indexes...");
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type)`);

    console.log("Schema fixed successfully ✅");
  } catch (err) {
    console.error("Error fixing schema:", err);
  } finally {
    await pool.end();
  }
}
fixSchema();
