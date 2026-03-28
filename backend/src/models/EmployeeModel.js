import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

export const initEmployeeModel = async () => {
  const query = `
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('ADMIN', 'INVENTORY_MANAGER', 'SALESPERSON');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS employees (
      employee_id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      nic VARCHAR(50) NOT NULL UNIQUE,
      telephone VARCHAR(20),
      role user_role NOT NULL,
      status user_status DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);

    const employeeCheck = await pool.query("SELECT COUNT(*) FROM employees");
    if (parseInt(employeeCheck.rows[0].count) === 0) {
      console.log("🌱 Seeding default admin user: Hiran Peiris...");
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      await pool.query(
        "INSERT INTO employees (full_name, email, password, nic, telephone, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        ["Hiran Peiris", "admin@system.com", hashedPassword, "199825419515", "0711240086", "ADMIN", "ACTIVE"]
      );
      console.log("✅ Default admin seeded: admin@system.com / Admin@123");
    }
};
