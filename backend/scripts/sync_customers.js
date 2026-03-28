import { pool } from "../src/config/db.js";

async function syncCustomerSchema() {
  try {
    console.log("🔄 Synchronizing 'customers' table with new schema...");
    
    // 1. Alter Column Lengths and Constraints
    const query = `
      -- 1. Ensure columns exist and have correct length
      ALTER TABLE customers ALTER COLUMN email TYPE VARCHAR(100);
      ALTER TABLE customers ALTER COLUMN password TYPE VARCHAR(100);
      
      -- 2. Handle 'tel' constraints (Assuming any current data fits in VARCHAR(10))
      ALTER TABLE customers ALTER COLUMN tel TYPE VARCHAR(10);
      ALTER TABLE customers ALTER COLUMN tel SET NOT NULL;
      
      -- 3. Handle 'address' constraints
      ALTER TABLE customers ALTER COLUMN address TYPE VARCHAR(255);
      ALTER TABLE customers ALTER COLUMN address SET NOT NULL;
    `;
    
    await pool.query(query);
    console.log("✅ 'customers' table synchronized successfully.");
  } catch (error) {
    if (error.code === '22001') {
      console.error("❌ ERROR: Current data is too long for the new column lengths (e.g., an address > 255 chars). Manual cleanup required.");
    } else if (error.code === '23502') {
       console.error("❌ ERROR: One or more customers have NULL tel or address, but NOT NULL constraint is requested. Manual cleanup required.");
    } else {
      console.error("❌ Failed to synchronize schema:", error.message);
    }
  } finally {
    await pool.end();
    process.exit();
  }
}

syncCustomerSchema();
