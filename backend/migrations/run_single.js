import pkg from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "fabric_management_system",
    port: process.env.DB_PORT || 5432,
});

async function runSingleMigration(filename) {
    try {
        const migrationPath = path.join(__dirname, filename);
        const sql = fs.readFileSync(migrationPath, "utf8");
        console.log(`📄 Running migration: ${filename}`);
        await pool.query(sql);
        console.log(`✅ Completed ${filename}`);
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error(`❌ Migration failed: ${error.message}`);
        await pool.end();
        process.exit(1);
    }
}

const targetFile = process.argv[2] || "017_seed_dashboard_data.sql";
runSingleMigration(targetFile);
