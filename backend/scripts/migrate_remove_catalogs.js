import { pool } from "../src/config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const migrate = async () => {
    try {
        console.log("Starting Migration: Removing catalogs and adding is_in_catalog...");

        await pool.query('BEGIN');

        // 1. Add new boolean column
        console.log("1. Adding is_in_catalog column to fabrics table if it doesn't exist...");
        await pool.query('ALTER TABLE fabrics ADD COLUMN IF NOT EXISTS is_in_catalog BOOLEAN DEFAULT TRUE;');

        // 2. Set all existing records to be in catalog
        console.log("2. Setting existing fabrics to is_in_catalog = true...");
        await pool.query('UPDATE fabrics SET is_in_catalog = true;');

        // 3. Drop catalog items
        console.log("3. Dropping catalog_items table...");
        await pool.query('DROP TABLE IF EXISTS catalog_items CASCADE;');

        // 4. Drop catalogs table
        console.log("4. Dropping catalogs table...");
        await pool.query('DROP TABLE IF EXISTS catalogs CASCADE;');

        await pool.query('COMMIT');
        
        console.log("Migration successful! 🚀");
        process.exit(0);
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
