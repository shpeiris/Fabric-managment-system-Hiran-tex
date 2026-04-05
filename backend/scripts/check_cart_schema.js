import { pool } from "../src/config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function checkSchema() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cart'");
    console.log("CART COLUMNS:");
    console.log(res.rows.map(r => r.column_name));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
checkSchema();
