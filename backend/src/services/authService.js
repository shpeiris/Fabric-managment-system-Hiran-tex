 import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * Find customer by email
 * @param {string} email
 * @returns {Promise<Object|null>} Customer data or null
 */
/**
 * Find user by email (checks customers, employees, and users)
 * @param {string} email
 * @returns {Promise<Object|null>} User data or null
 */
const findUserByEmail = async (email) => {
  try {
    // Check customers
    const customerSql = "SELECT * FROM customers WHERE email = $1";
    const customerResult = await pool.query(customerSql, [email]);
    if (customerResult.rows.length > 0) return customerResult.rows[0];

    // Check employees
    const employeeSql = "SELECT * FROM employees WHERE email = $1";
    const employeeResult = await pool.query(employeeSql, [email]);
    if (employeeResult.rows.length > 0) return employeeResult.rows[0];

    return null;

    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Find user by email or username (legacy support)
 * @param {string} email
 * @param {string} username
 * @returns {Promise<Array>} Array of matching users (dummy implementation for interface compatibility)
 */
const findUserByEmailOrUsername = async (email, username) => {
  // We only check by email now as username is deprecated/optional
  const user = await findUserByEmail(email);
  return user ? [user] : [];
};

/**
 * Create new customer
 * @param {Object} userData - { full_name, email, phone, password, address }
 * @returns {Promise<Object>} Created customer data
 */
const createUser = async (userData) => {
  const { full_name, email, phone, password, address } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const sql = `
      INSERT INTO customers (full_name, email, password, tel, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING customer_id, full_name, email, tel, address, created_at
    `;

    const result = await pool.query(sql, [
      full_name,
      email,
      hashedPassword,
      phone,
      address,
    ]);

    const customer = result.rows[0];
    return {
      id: customer.customer_id,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.tel,
      address: customer.address,
      role: "CUSTOMER",
      created_at: customer.created_at,
    };
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === "23505") {
      throw new Error("User with this email already exists");
    }
    throw error;
  }
};

/**
 * Verify password
 * @param {string} inputPassword
 * @param {string} storedPassword
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (inputPassword, storedPassword) => {
  return await bcrypt.compare(inputPassword, storedPassword);
};

/**
 * Find employee by email (for staff login)
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
const findEmployeeByEmail = async (email) => {
  try {
    const sql =
      "SELECT * FROM employees WHERE email = $1 AND status = 'ACTIVE'";
    const result = await pool.query(sql, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Universal login - checks customers, employees, and users
 * @param {string} email
 * @returns {Promise<Object|null>} User data with role
 */
const findUserForLogin = async (email) => {
  try {
    // 1. Check customers
    const customerResult = await pool.query(
      "SELECT * FROM customers WHERE email = $1",
      [email],
    );
    if (customerResult.rows.length > 0) {
      const customer = customerResult.rows[0];
      return {
        id: customer.customer_id,
        full_name: customer.full_name,
        email: customer.email,
        password: customer.password,
        role: "CUSTOMER",
        tel: customer.tel,
      };
    }

    // 2. Check employees
    const employeeResult = await pool.query(
      "SELECT * FROM employees WHERE email = $1 AND status = 'ACTIVE'",
      [email],
    );
    if (employeeResult.rows.length > 0) {
      const employee = employeeResult.rows[0];

      // Map DB roles to Frontend roles
      let frontendRole = employee.role;
      if (employee.role === "INVENTORY") frontendRole = "INVENTORY_MANAGER";
      if (employee.role === "SALES") frontendRole = "SALESPERSON";

      return {
        id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        password: employee.password,
        role: frontendRole,
        telephone: employee.telephone,
        nic: employee.nic,
      };
    }

    return null;

    return null;
  } catch (error) {
    throw error;
  }
};

/**
 * Create OTP for password reset
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<void>}
 */
const createOTP = async (email, otp) => {
  try {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Clear any existing OTPs for this email first
    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

    const sql = `
      INSERT INTO password_resets (email, otp, expires_at)
      VALUES ($1, $2, $3)
    `;
    await pool.query(sql, [email, otp, expiresAt]);
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP
 * @param {string} email
 * @param {string} otp
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (email, otp) => {
  try {
    const sql = `
      SELECT * FROM password_resets 
      WHERE email = $1 AND otp = $2 AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await pool.query(sql, [email, otp]);
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user password
 * @param {string} email
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
const updatePassword = async (email, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {
    // Try updating customers
    const customerRes = await pool.query(
      "UPDATE customers SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    // Try updating employees
    const employeeRes = await pool.query(
      "UPDATE employees SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

    if (customerRes.rowCount === 0 && employeeRes.rowCount === 0) {
      throw new Error("User not found");
    }

    // Clear the used OTP
    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);
  } catch (error) {
    throw error;
  }
};

export {
  findUserByEmail,
  findUserByEmailOrUsername,
  createUser,
  verifyPassword,
  findEmployeeByEmail,
  findUserForLogin,
  createOTP,
  verifyOTP,
  updatePassword,
};
