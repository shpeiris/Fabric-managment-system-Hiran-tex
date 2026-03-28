import { pool } from "../src/config/db.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Apply the correct database schema
 */
async function applyCorrectSchema() {
    try {
        console.log('🗃️ Applying correct database schema...');
        
        // Read the schema file
        const schemaPath = path.join(__dirname, '..', 'CORRECT_DATABASE_SCHEMA.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute the schema
        await pool.query(schemaSQL);
        
        console.log('✅ Database schema applied successfully!');
        console.log('\n📋 Your database now has these tables:');
        console.log('   1. employees (admin, inventory, sales staff)');
        console.log('   2. customers (independent customer accounts)');
        console.log('   3. suppliers (fabric suppliers)');
        console.log('   4. fabrics (inventory items)');
        console.log('   5. cart (customer shopping cart)');
        console.log('   6. orders (customer orders)');
        console.log('   7. order_items (order line items)');
        console.log('   8. stock_arrivals (inventory arrivals)');
        console.log('   9. payments (order payments)');
        console.log('   10. activity_logs (employee actions)');
        
    } catch (error) {
        console.error('❌ Schema application failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

/**
 * Show current table structure
 */
async function showTables() {
    try {
        console.log('📊 Current database tables:\n');
        
        const result = await pool.query(`
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
            FROM information_schema.tables t 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        for (const table of result.rows) {
            console.log(`📋 ${table.table_name} (${table.columns} columns)`);
            
            // Get sample count
            try {
                const count = await pool.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
                console.log(`   └─ ${count.rows[0].count} records`);
            } catch (err) {
                console.log('   └─ Cannot count records');
            }
        }
        
    } catch (error) {
        console.error('❌ Cannot show tables:', error.message);
    }
}

// Main execution
if (process.argv.includes('--apply')) {
    applyCorrectSchema().finally(() => process.exit(0));
} else if (process.argv.includes('--show')) {
    showTables().finally(() => process.exit(0));
} else {
    console.log('🗃️ Correct Database Schema Tool');
    console.log('\nUsage:');
    console.log('  node correct-schema.js --apply    # Apply correct schema');
    console.log('  node correct-schema.js --show     # Show current tables');
    console.log('\nThis tool applies the final, correct database structure.');
    process.exit(0);
}

export { applyCorrectSchema, showTables };