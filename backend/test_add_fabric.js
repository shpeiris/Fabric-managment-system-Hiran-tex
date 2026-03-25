import { pool } from './config/db.js';

const testAddFabric = async () => {
    try {
        const query = `
            INSERT INTO fabrics (name, material_type, color, design, price_per_meter, stock_quantity, width, restock_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING fabric_id;
        `;
        const res = await pool.query(query, [
            'Test Fabric', 'Cotton', 'Red', 'Plain', 500.00, 100, '45 inch', '2026-04-01'
        ]);
        console.log("Successfully added test fabric with ID:", res.rows[0].fabric_id);
        
        // Cleanup
        await pool.query("DELETE FROM fabrics WHERE fabric_id = $1", [res.rows[0].fabric_id]);
        console.log("Cleaned up test fabric.");
        
    } catch (err) {
        console.error("Failed to add test fabric:", err.message);
    } finally {
        await pool.end();
    }
};

testAddFabric();
