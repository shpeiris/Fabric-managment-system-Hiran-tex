import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

const createUser = async (userData, creatorId) => {
  const { full_name, email, telephone, nic, password, role, frontendRole } =
    userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    let sql;
    let params;
    let isCustomer = frontendRole === "CUSTOMER";

    if (isCustomer) {
      // Insert into Customers table
      sql =
        "INSERT INTO customers (full_name, email, password, tel, address) VALUES ($1, $2, $3, $4, $5) RETURNING customer_id as id, created_at";
      params = [full_name, email, hashedPassword, telephone || null, "N/A"]; // Default address N/A for now as it's not in the form
    } else {
      // Insert into Employees table
      sql =
        "INSERT INTO employees (full_name, email, password, nic, telephone, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING employee_id as id, created_at";
      // Map Roles for DB (Ensuring compatibility with database ENUM/CHECK constraints)
      let dbRole = role;
      if (role === "INVENTORY_MANAGER") dbRole = "INVENTORY";
      if (role === "SALESPERSON") dbRole = "SALES";

      params = [
        full_name,
        email,
        hashedPassword,
        nic,
        telephone || null,
        dbRole,
        "ACTIVE",
      ];
    }

    pool.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.rows[0].id,
        ...userData,
        role: frontendRole, // Return the frontend role for consistent UI
        created_at: result.rows[0].created_at,
      });
    });
  });
};

const getAllUsers = async () => {
  return new Promise((resolve, reject) => {
    // Union both tables to look like the unified users list
    const sql = `
      SELECT 
        customer_id as id, 
        full_name, 
        email, 
        tel as phone, 
        'CUSTOMER' as role, 
        'ACTIVE' as status, 
        created_at 
      FROM customers
      UNION ALL
      SELECT 
        employee_id as id, 
        full_name, 
        email, 
        telephone as phone, 
        CASE 
          WHEN role = 'INVENTORY' THEN 'INVENTORY_MANAGER'
          WHEN role = 'SALES' THEN 'SALESPERSON'
          ELSE role::text 
        END as role,
        status::text,
        created_at 
      FROM employees
      ORDER BY created_at DESC
    `;
    pool.query(sql, (err, result) => {
      if (err) return reject(err);
      resolve(result.rows);
    });
  });
};

const updateUserStatus = async (userId, status) => {
  // Try update employee status (Customers don't have status in DB schema, only employees)
  return new Promise((resolve, reject) => {
    // Only employees table has status column in the schema provided
    const sql =
      "UPDATE employees SET status = $1::user_status WHERE employee_id = $2";
    pool.query(sql, [status, userId], (err, result) => {
      if (err) return reject(err);
      if (result.rowCount === 0) {
        // If not found in employees, it might be a customer, but customers don't have status column to update?
        // Checking schema: customers table has NO status column.
        return resolve(null);
      }
      resolve({ id: userId, status });
    });
  });
};

const deleteUser = async (email) => {
  return new Promise((resolve, reject) => {
    // First try to delete from customers table
    const deleteCustomerSql = "DELETE FROM customers WHERE email = $1";
    pool.query(deleteCustomerSql, [email], (err, customerResult) => {
      if (err) return reject(err);
      
      if (customerResult.rowCount > 0) {
        // Customer was deleted successfully
        return resolve({ deleted: true, table: 'customers', rowsAffected: customerResult.rowCount });
      }
      
      // If no customer found, try employees table
      const deleteEmployeeSql = "DELETE FROM employees WHERE email = $1";
      pool.query(deleteEmployeeSql, [email], (err, employeeResult) => {
        if (err) return reject(err);
        
        if (employeeResult.rowCount > 0) {
          return resolve({ deleted: true, table: 'employees', rowsAffected: employeeResult.rowCount });
        }
        
        // User not found in either table
        resolve({ deleted: false, message: 'User not found' });
      });
    });
  });
};

export { createUser, getAllUsers, updateUserStatus, deleteUser };
