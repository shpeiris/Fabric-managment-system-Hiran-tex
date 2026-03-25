import { pool } from "../config/db.js";

async function addDeliveryDetails() {
  try {
    console.log("Adding delivery details columns to 'orders' table...");
    
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS delivered_by VARCHAR(255),
      ADD COLUMN IF NOT EXISTS delivery_contact_number VARCHAR(20)
    `);

    console.log("Database updated successfully ✅");
  } catch (err) {
    console.error("Error updating database:", err);
  } finally {
    await pool.end();
  }
}

addDeliveryDetails();
