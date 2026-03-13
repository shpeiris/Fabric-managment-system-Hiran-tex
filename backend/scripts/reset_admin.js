import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

async function resetAdminPassword() {
  const email = "admin@system.com";
  const newPassword = "admin123";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const result = await pool.query(
      "UPDATE employees SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    if (result.rowCount > 0) {
      console.log(`✅ Password reset for ${email} to 'admin123'`);
    } else {
      console.log(`❌ Admin user ${email} not found.`);
    }
  } catch (error) {
    console.error("❌ Error resetting password:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

resetAdminPassword();
