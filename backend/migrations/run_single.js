// Script to run a single migration file
import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSingleMigration() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Please provide the path to the migration file.");
    process.exit(1);
  }

  try {
    console.log(`🚀 Running migration: ${filePath}...`);
    const sql = fs.readFileSync(path.resolve(filePath), "utf8");
    await pool.query(sql);
    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runSingleMigration();
