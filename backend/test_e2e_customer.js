import { pool } from './config/db.js';

const testAddToCart = async () => {
    try {
        // 1. Add a test fabric
        const fabricQuery = `
            INSERT INTO fabrics (name, material_type, color, design, price_per_meter, stock_quantity, width)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING fabric_id;
        `;
        const fabricRes = await pool.query(fabricQuery, [
            'End-to-End Test Fabric', 'Silk', 'Silver', 'Satin', 1200.00, 50, '42 inch'
        ]);
        const fabricId = fabricRes.rows[0].fabric_id;
        console.log("Added test fabric with ID:", fabricId);

        // 2. Add to cart for customer 1
        const cartQuery = `
            INSERT INTO cart (customer_id, fabric_id, quantity, total_price)
            VALUES ($1, $2, $3, $4)
            RETURNING cart_id;
        `;
        const cartRes = await pool.query(cartQuery, [1, fabricId, 1, 1200.00]);
        const cartId = cartRes.rows[0].cart_id;
        console.log("Successfully added to cart! Cart ID:", cartId);

        // 3. Cleanup
        await pool.query("DELETE FROM cart WHERE cart_id = $1", [cartId]);
        await pool.query("DELETE FROM fabrics WHERE fabric_id = $1", [fabricId]);
        console.log("Cleaned up test data.");

    } catch (err) {
        console.error("End-to-end test failed:", err.message);
    } finally {
        await pool.end();
    }
};

testAddToCart();
