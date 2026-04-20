import { pool } from "./src/config/db.js";

async function diagnose() {
  console.log("--- Diagnosing getAllUsers Query ---");
  const sql = `
    SELECT 
      customer_id as id, 
      full_name, 
      email, 
      tel as phone, 
      'CUSTOMER'::text as role, 
      'ACTIVE'::text as status, 
      created_at 
    FROM customers
    UNION ALL
    SELECT 
      employee_id as id, 
      full_name, 
      email, 
      telephone as phone, 
      CASE 
        WHEN role::text = 'INVENTORY' OR role::text = 'INVENTORY_MANAGER' THEN 'INVENTORY_MANAGER'
        WHEN role::text = 'SALES' OR role::text = 'SALESPERSON' THEN 'SALESPERSON'
        ELSE role::text 
      END as role,
      status::text,
      created_at 
    FROM employees
    ORDER BY created_at DESC
  `;

  try {
    const res = await pool.query(sql);
    console.log("Query Successful! Row count:", res.rowCount);
  } catch (err) {
    console.error("Query Failed!");
    console.error("Error Code:", err.code);
    console.error("Error Message:", err.message);
    if (err.hint) console.error("Hint:", err.hint);
  } finally {
    process.exit();
  }
}

diagnose();
