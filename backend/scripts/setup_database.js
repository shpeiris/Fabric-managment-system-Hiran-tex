import { pool } from "./config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    console.log("🚀 Starting database setup...");

    try {
        const schemaPath = path.join(__dirname, "postgres_schema.sql");
        const schemaSql = fs.readFileSync(schemaPath, "utf8");

        console.log("📄 Reading schema file...");

        // Execute the schema SQL
        // Note: In a production environment, you'd want to handle this more robustly
        // but for setup purposes, this is fine for PostgreSQL
        await pool.query(schemaSql);

        console.log("✅ Database schema created and seeded successfully!");

        // Double check admin user
        const adminCheck = await pool.query("SELECT * FROM employees WHERE email = $1", ["admin@system.com"]);
        if (adminCheck.rows.length > 0) {
            console.log("👑 Admin user verified: admin@system.com");
        } else {
            console.warn("⚠️ Admin user not found! Please check seeds.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error setting up database:", error);
        process.exit(1);
    }
}

setupDatabase();
