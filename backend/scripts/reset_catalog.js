import { pool } from "../src/config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const resetCatalog = async () => {
  try {
    console.log("Resetting Catalog Data...");

    // 1. Clear all items from all catalogs
    await pool.query("TRUNCATE TABLE catalog_items CASCADE");
    console.log(" ✓ Cleared all catalog items.");

    // 2. Clear catalogs table
    await pool.query("DELETE FROM catalogs");
    console.log(" ✓ Cleared all catalogs.");

    // 3. Initialize Catalog ID 1
    await pool.query(
      "INSERT INTO catalogs (catalog_id, name, description) VALUES (1, 'Main Collection', 'Primary fabric collection for customers')"
    );
    console.log(" ✓ Re-initialized Catalog ID 1 (Main Collection).");

    console.log("\nCatalog reset complete successfully! 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Failed to reset catalog:", error);
    process.exit(1);
  }
};

resetCatalog();
