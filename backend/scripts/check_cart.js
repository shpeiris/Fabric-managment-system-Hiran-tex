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
    const res = await client.query('SELECT * FROM cart WHERE fabric_id = 3 ORDER BY cart_id DESC');
    console.log("CART_RESULTS_START");
    console.log(JSON.stringify(res.rows));
    console.log("CART_RESULTS_END");
  } catch (err) {
    console.error("DIAGNOSTIC_ERROR:", err.message);
  } finally {
    await client.end();
  }
}

checkCart();
