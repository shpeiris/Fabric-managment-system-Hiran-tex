import { pool } from './config/db.js';

const checkSchema = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'fabrics'
            ORDER BY ordinal_position;
        `);
        console.log("Current fabrics table schema:");
        res.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });
        
        const expectedColumns = [
            'fabric_id', 'name', 'material_type', 'color', 'design', 
            'price_per_meter', 'stock_quantity', 'stock_available_quantity', 
            'reorder_level', 'image_url', 'width', 'restock_date', 'created_at'
        ];
        
        const currentColumns = res.rows.map(r => r.column_name);
        const missing = expectedColumns.filter(c => !currentColumns.includes(c));
        
        if (missing.length > 0) {
            console.log("\nMissing columns:", missing.join(', '));
        } else {
            console.log("\nAll expected columns are present.");
        }
        
    } catch (err) {
        console.error("Error checking schema:", err);
    } finally {
        await pool.end();
    }
};

checkSchema();
