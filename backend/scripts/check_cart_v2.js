import pkg from 'pg';
const { Client } = pkg;

async function checkCart() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'admin',
    database: 'fabric_management_system',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT cart_id, customer_id, fabric_id, quantity FROM cart WHERE fabric_id = 3');
    console.log("--- CART DATA START ---");
    res.rows.forEach(row => {
        console.log(`Cart ID: ${row.cart_id}, Customer ID: ${row.customer_id}, Fabric ID: ${row.fabric_id}, Quantity: ${row.quantity}`);
    });
    console.log("--- CART DATA END ---");
    
    const fabricRes = await client.query('SELECT fabric_id, name, stock_available_quantity FROM fabrics WHERE fabric_id = 3');
    console.log("--- FABRIC DATA START ---");
    console.log(`Fabric ID: ${fabricRes.rows[0].fabric_id}, Name: ${fabricRes.rows[0].name}, Available: ${fabricRes.rows[0].stock_available_quantity}`);
    console.log("--- FABRIC DATA END ---");

  } catch (err) {
    console.error("DEBUG_ERROR:", err.message);
  } finally {
    await client.end();
  }
}

checkCart();
