import { pool } from "../src/config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function resetAdmin() {
  const email = "admin@system.com";
  const password = "Admin@123";
  const fullName = "Hiran Peiris";
  const nic = "199825419515";
  const telephone = "0711240086";

  try {
    console.log(`🔐 Resetting Admin user: ${email}...`);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const checkUser = await pool.query("SELECT * FROM employees WHERE email = $1", [email]);

    if (checkUser.rows.length > 0) {
      // Update existing
      await pool.query(
        "UPDATE employees SET full_name = $1, password = $2, nic = $3, telephone = $4, role = 'ADMIN', status = 'ACTIVE' WHERE email = $5",
        [fullName, hashedPassword, nic, telephone, email]
      );
      console.log(`✅ Admin user ${email} updated successfully.`);
    } else {
      // Insert new
      await pool.query(
        "INSERT INTO employees (full_name, email, password, nic, telephone, role, status) VALUES ($1, $2, $3, $4, $5, 'ADMIN', 'ACTIVE')",
        [fullName, email, hashedPassword, nic, telephone]
      );
      console.log(`✅ Admin user ${email} created successfully.`);
    }

  } catch (error) {
    console.error("❌ Error resetting admin:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

resetAdmin();
