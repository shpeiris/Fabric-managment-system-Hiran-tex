import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "fabric_management_system",
  port: process.env.DB_PORT || 5432,
});

async function testCartCount() {
  const customerId = 1; // Assuming customer 1 exists
  try {
    console.log('--- Testing Cart Count ---');
    
    // 1. Get initial count
    const initialRes = await pool.query('SELECT COALESCE(SUM(quantity), 0) as count FROM cart WHERE customer_id = $1', [customerId]);
    const initialCount = parseFloat(initialRes.rows[0].count);
    console.log('Initial count from DB:', initialCount);

    // 2. Add an item
    await pool.query('INSERT INTO cart (customer_id, fabric_id, quantity, total_price) VALUES ($1, $2, $3, $4)', [customerId, 1, 5.5, 5500]);
    console.log('Added 5.5m to cart.');

    // 3. Check count via SQL (simulating the service)
    const newRes = await pool.query('SELECT COALESCE(SUM(quantity), 0) as count FROM cart WHERE customer_id = $1', [customerId]);
    const newCount = parseFloat(newRes.rows[0].count);
    console.log('New count from DB:', newCount);

    if (newCount === initialCount + 5.5) {
      console.log('✅ Cart count logic works correctly!');
    } else {
      console.log('❌ Cart count logic failed. Expected:', initialCount + 5.5, 'Got:', newCount);
    }

    // 4. Cleanup
    await pool.query('DELETE FROM cart WHERE customer_id = $1 AND fabric_id = $2 AND quantity = $3', [customerId, 1, 5.5]);
    console.log('Cleaned up test data.');

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await pool.end();
  }
}

testCartCount();
