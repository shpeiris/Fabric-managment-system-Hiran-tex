import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkUsers() {
  try {
    const customers = await pool.query('SELECT count(*) FROM customers');
    const employees = await pool.query('SELECT count(*) FROM employees');
    console.log('--- DATABASE CHECK ---');
    console.log(`Customers: ${customers.rows[0].count}`);
    console.log(`Employees: ${employees.rows[0].count}`);
    
    if (parseInt(employees.rows[0].count) > 0) {
      const empDetails = await pool.query('SELECT email, role, status FROM employees');
      console.log('Employees in DB:', empDetails.rows);
    }
    
    if (parseInt(customers.rows[0].count) > 0) {
      const custDetails = await pool.query('SELECT email FROM customers');
      console.log('Customers in DB:', custDetails.rows);
    }
  } catch (err) {
    console.error('Error checking database:', err.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
