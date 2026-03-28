import { pool } from "../src/config/db.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Remove users table and clean up references
 */
async function removeUsersTable() {
    try {
        console.log('🗑️ Starting users table removal migration...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '012_remove_users_table.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        console.log('✅ Users table removal completed successfully!');
        console.log('\n📋 Changes made:');
        console.log('   • Dropped users table completely');
        console.log('   • Updated activity_logs to reference employees');
        console.log('   • Removed user_id from customers table');
        console.log('   • Updated cart to reference customers directly');
        console.log('   • Updated orders foreign keys');
        console.log('   • Updated payments to reference employees');
        console.log('   • Updated all SQL queries in services');
        
        console.log('\n🎯 Your database now uses:');
        console.log('   • employees table for staff (admin, inventory, sales)');
        console.log('   • customers table for clients');
        console.log('   • No redundant users table');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

/**
 * Check what tables exist after cleanup
 */
async function verifyCleanup() {
    try {
        console.log('🔍 Verifying database structure...\n');
        
        // Check if users table still exists
        const usersCheck = await pool.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'users'
            )
        `);
        
        console.log(`👤 Users table: ${usersCheck.rows[0].exists ? '❌ Still exists' : '✅ Removed'}`);
        
        // Check employees table
        const employeesCheck = await pool.query(`
            SELECT COUNT(*) as count FROM employees
        `);
        
        console.log(`👨‍💼 Employees table: ✅ ${employeesCheck.rows[0].count} records`);
        
        // Check customers table
        const customersCheck = await pool.query(`
            SELECT COUNT(*) as count FROM customers
        `);
        
        console.log(`👥 Customers table: ✅ ${customersCheck.rows[0].count} records`);
        
        // Check activity_logs structure
        const activityColumns = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'activity_logs' 
            ORDER BY ordinal_position
        `);
        
        console.log('📊 Activity logs columns:');
        activityColumns.rows.forEach(col => {
            console.log(`   • ${col.column_name}`);
        });
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

// Main execution
if (process.argv.includes('--remove')) {
    removeUsersTable().finally(() => process.exit(0));
} else if (process.argv.includes('--verify')) {
    verifyCleanup().finally(() => process.exit(0));
} else {
    console.log('🗑️ Users Table Removal Tool');
    console.log('\nUsage:');
    console.log('  node migrations/remove-users.js --remove    # Remove users table');
    console.log('  node migrations/remove-users.js --verify    # Verify cleanup');
    console.log('\nThis tool removes the redundant users table and updates all references.');
    console.log('Your app will use employees and customers tables directly.');
    process.exit(0);
}