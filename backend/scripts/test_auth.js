import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function testLogin() {
  const email = 'admin@system.com';
  const password = '123456';
  
  try {
    const res = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = res.rows[0];
    console.log('User found:', user.email);
    console.log('Stored Hash:', user.password);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Is Password Valid (bcrypt.compare):', isValid);
    
    const manualHash = await bcrypt.hash(password, 10);
    console.log('New Hash for 123456:', manualHash);
    const manualValid = await bcrypt.compare(password, manualHash);
    console.log('Is 123456 valid against new hash:', manualValid);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

testLogin();
