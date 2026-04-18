import { pool } from "../src/config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const fullReset = async () => {
  try {
    console.log("Starting Full Fabric Reset...");

    // 1. Truncate fabrics and RESET IDENTITY (Restart IDs from 1)
    await pool.query("TRUNCATE TABLE fabrics RESTART IDENTITY CASCADE");
    console.log(" ✓ Fully deleted all fabrics and RESET primary key IDs to 1.");

    console.log("\nFull Reset complete! You can now add fresh fabrics starting from scratch. 🚀");
    process.exit(0);
  } catch (error) {
    console.error("Full Reset failed:", error);
    process.exit(1);
  }
};

fullReset();
