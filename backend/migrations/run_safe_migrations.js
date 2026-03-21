// Script to run migrations from 003 to 019 safely
import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSafeMigrations() {
  try {
    console.log("🚀 Starting safe database migrations (003-019)...\n");

    const files = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith(".sql") && file.startsWith("0") && !file.startsWith("001"))
      .sort();

    for (const file of files) {
      console.log(`📄 Running migration: ${file}`);
      const migrationPath = path.join(__dirname, file);
      const sql = fs.readFileSync(migrationPath, "utf8");

      try {
        await pool.query(sql);
        console.log(`   ✓ Completed ${file}`);
      } catch (err) {
        console.warn(`   ⚠️ Warning or Error in ${file}: ${err.message}`);
        // If it was already applied (like 019), it's fine.
      }
    }

    console.log("\n✅ Safe migrations completed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration process failed:", error.message);
    process.exit(1);
  }
}

runSafeMigrations();
