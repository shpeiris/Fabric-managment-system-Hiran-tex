// Database migration runner script
import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log("🚀 Starting database migration...\n");

    // Read migration files
    const files = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      console.log(`📄 Running migration: ${file}`);
      const migrationPath = path.join(__dirname, file);
      const sql = fs.readFileSync(migrationPath, "utf8");

      // Execute the migration
      await pool.query(sql);
      console.log(`   ✓ Completed ${file}`);
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Tables created:");
    console.log("  - employees");
    console.log("  - customers");
    console.log("  - suppliers");
    console.log("  - fabrics");
    console.log("  - cart");
    console.log("  - orders");
    console.log("  - order_items");
    console.log("  - payments");
    console.log("  - activity_logs");
    console.log("\n👤 Admin user seeded:");
    console.log("  Email: admin@system.com");
    console.log("  Password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
