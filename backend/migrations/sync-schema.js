import { pool } from "../src/config/db.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run the schema synchronization migration
 */
async function runSchemaSyncMigration() {
    try {
        console.log('🔄 Starting schema synchronization migration...');
        
        // Read the migration file
        const migrationPath = path.join(__dirname, '011_sync_schema_with_frontend_backend.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute the migration
        await pool.query(migrationSQL);
        
        console.log('✅ Schema synchronization migration completed successfully!');
        console.log('\n📋 Changes made:');
        console.log('   • Updated fabrics table with frontend field names');
        console.log('   • Fixed cart table foreign key references');  
        console.log('   • Added missing order fields (phone, delivery_type, etc.)');
        console.log('   • Standardized order_items column names');
        console.log('   • Created stock_arrivals table if missing');
        console.log('   • Updated payments table with bank_slip_url');
        console.log('   • Added performance indexes');
        console.log('   • Added data validation constraints');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

/**
 * Check current schema status
 */
async function checkSchemaStatus() {
    try {
        console.log('🔍 Checking current schema status...\n');
        
        // Check fabrics table columns
        const fabricsColumns = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'fabrics' 
            ORDER BY ordinal_position
        `);
        
        console.log('📊 Fabrics table columns:');
        fabricsColumns.rows.forEach(col => {
            console.log(`   • ${col.column_name} (${col.data_type})`);
        });
        
        // Check cart table structure
        const cartColumns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'cart' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n🛒 Cart table columns:');
        cartColumns.rows.forEach(col => {
            console.log(`   • ${col.column_name} (${col.data_type})`);
        });
        
        // Check orders table structure  
        const ordersColumns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'orders' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 Orders table columns:');
        ordersColumns.rows.forEach(col => {
            console.log(`   • ${col.column_name} (${col.data_type})`);
        });
        
        // Check if stock_arrivals table exists
        const stockArrivalsExists = await pool.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'stock_arrivals'
            )
        `);
        
        console.log(`\n📦 Stock arrivals table: ${stockArrivalsExists.rows[0].exists ? '✅ Exists' : '❌ Missing'}`);
        
    } catch (error) {
        console.error('❌ Schema check failed:', error.message);
    }
}

// Main execution
if (process.argv.includes('--check')) {
    checkSchemaStatus().finally(() => process.exit(0));
} else if (process.argv.includes('--migrate')) {
    runSchemaSyncMigration().finally(() => process.exit(0));
} else {
    console.log('📚 Database Schema Synchronization Tool');
    console.log('\nUsage:');
    console.log('  node migrations/sync-schema.js --check     # Check current schema');
    console.log('  node migrations/sync-schema.js --migrate   # Run synchronization migration');
    console.log('\nThis tool synchronizes your database schema with frontend/backend usage.');
    process.exit(0);
}