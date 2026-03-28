import * as userService from "../services/userService.js";
import * as authService from "../services/authService.js"; // reusing check logic
import logActivity from "../middleware/activityLogger.js";

const createUser = async (req, res) => {
  const { full_name, email, telephone, nic, password, role, address } = req.body;

  // Validation
  if (!full_name || !email || !role) {
    return res
      .status(400)
      .json({ error: "Full name, email, and role are required" });
  }

  // Valid roles that admin can create
  const validRoles = ["INVENTORY_MANAGER", "SALESPERSON", "CUSTOMER"];
  if (!validRoles.includes(role.toUpperCase())) {
    return res.status(400).json({
      error:
        "Invalid role. Admin can only create INVENTORY_MANAGER, SALESPERSON, or CUSTOMER accounts",
      validRoles: validRoles,
    });
  }

  // Check NIC for staff
  if (role !== "CUSTOMER" && !nic) {
    return res
      .status(400)
      .json({ error: "NIC is required for staff accounts" });
  }

  // 10-digit phone validation if provided
  if (telephone) {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(telephone)) {
      return res
        .status(400)
        .json({ error: "Phone number must be exactly 10 digits" });
    }
  }

  // Map Roles for DB (Frontend Role -> DB Role)
  let dbRole = role;
  if (role === "INVENTORY_MANAGER") dbRole = "INVENTORY_MANAGER";
  if (role === "SALESPERSON") dbRole = "SALESPERSON";

  // Generate default password if not provided
  let userPassword = password;
  let isDefaultPassword = false;
  let generatedPassword = null;

  if (!password || password.trim() === "") {
    // For now, use a fixed default password as requested
    userPassword = "Employee@123";
    isDefaultPassword = true;
    generatedPassword = userPassword; // Store to return in response
  } else if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  try {
    // Check if user already exists
    const existingUsers = await authService.findUserByEmail(email);
    if (existingUsers) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const newUser = await userService.createUser(
      {
        full_name,
        email,
        telephone,
        nic,
        password: userPassword,
        role: dbRole,
        address,
        frontendRole: role,
      },
      req.user.id,
    );

    // Log user creation
    logActivity(
      req.user,
      "CREATE_USER",
      `Created user: ${email} (${role.toUpperCase()})`,
      req,
    );

    const response = {
      message: `${role.toUpperCase()} account created successfully`,
      user: newUser,
    };

    // Include generated password if default was used
    if (isDefaultPassword && generatedPassword) {
      response.generatedPassword = generatedPassword;
      response.isDefaultPassword = true;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Database error creating user" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Database error" });
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["ACTIVE", "INACTIVE"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Invalid status. Use ACTIVE or INACTIVE" });
  }

  try {
    const result = await userService.updateUserStatus(id, status);

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: `User status updated to ${status}`,
      userId: id,
      newStatus: status,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Database error" });
  }
};

const deleteUser = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await userService.deleteUser(email);

    if (!result.deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    // Log user deletion
    logActivity(
      req.user,
      "DELETE_USER",
      `Deleted user: ${email} from ${result.table}`,
      req,
    );

    res.json({
      message: `User ${email} deleted successfully`,
      email: email,
      table: result.table,
      rowsAffected: result.rowsAffected
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Database error" });
  }
};

export { createUser, getAllUsers, updateUserStatus, deleteUser };
