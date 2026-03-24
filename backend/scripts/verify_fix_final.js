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

async function verifyFix() {
  const emailWithSpaces = '  admin@system.com  ';
  const password = 'Admin@123';
  
  const trimmedEmail = emailWithSpaces.trim();
  
  try {
    const res = await pool.query('SELECT * FROM employees WHERE email = $1', [trimmedEmail]);
    if (res.rows.length === 0) {
      console.log('User not found even after trimming');
      return;
    }
    
    const user = res.rows[0];
    console.log('User found:', user.email);
    
    const isValid = await bcrypt.compare(password, user.password);
    console.log('Is Password Valid (Admin@123):', isValid);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

verifyFix();
