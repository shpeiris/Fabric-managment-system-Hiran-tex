import pkg from 'pg';
const { Client } = pkg;

async function checkDirect() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'admin',
    database: 'fabric_management_system',
  });

  try {
    await client.connect();
    const res = await client.query('SELECT fabric_id, name, stock_quantity, stock_available_quantity FROM fabrics WHERE fabric_id = 3');
    console.log("RESULT_START");
    console.log(JSON.stringify(res.rows[0]));
    console.log("RESULT_END");
  } catch (err) {
    console.error("DIAGNOSTIC_ERROR:", err.message);
  } finally {
    await client.end();
  }
}

checkDirect();
