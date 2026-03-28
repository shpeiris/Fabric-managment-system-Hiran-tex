import pkg from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { Pool } = pkg;

// PostgreSQL connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "fabric_management_system",
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.log("Database connection failed ❌", err);
  } else {
    console.log("PostgreSQL Connected ✅");
    release();
  }
});

// Helper function for query execution
const query = (text, params) => pool.query(text, params);

export { query, pool };
