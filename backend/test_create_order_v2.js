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

async function testCreateOrder() {
  const orderData = {
    customer_id: 16,
    customer_name: 'Test Customer',
    phone_number: '0712345678',
    delivery_address: '123 Test St',
    delivery_type: 'GAMPAHA',
    payment_method: 'CASH',
    special_instructions: 'No instructions',
    items: [
      { fabric_id: 42, quantity: 2 } 
    ]
  };

  try {
    const { createOrder } = await import('./services/orderService.js');
    const result = await createOrder(orderData);
    console.log('SUCCESS:', result);
  } catch (err) {
    console.log('FAILURE:', err.message);
    console.log('STACK:', err.stack);
  } finally {
    await pool.end();
  }
}

testCreateOrder();
