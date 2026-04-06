import * as authService from "../services/authService.js";
import logActivity from "../middleware/activityLogger.js";
import { generateToken } from "../utils/jwtHelper.js";
import { sendOTPEmail } from "../utils/emailHelper.js";

const login = async (req, res) => {
  let { email, password } = req.body;
  email = email ? email.trim() : email;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check both customers and employees tables
    const user = await authService.findUserForLogin(email);

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid credentials or account inactive" });
    }

    const isPasswordValid = await authService.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create session
    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    };

    // Role-based redirection paths
    const redirectPaths = {
      ADMIN: "/admin/dashboard",
      INVENTORY: "/inventory/dashboard",
      INVENTORY_MANAGER: "/inventory/dashboard",
      SALES: "/sales/dashboard",
      SALESPERSON: "/sales/dashboard",
      CUSTOMER: "/customer/dashboard",
    };

    // Generate JWT Token
    const token = generateToken(user);

    // Log successful login
    logActivity(user, "LOGIN", "User logged in", req);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      token,
      redirectTo: redirectPaths[user.role] || "/dashboard",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Database error during login" });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie("fabric_session");
    res.json({ message: "Logout successful" });
  });
};

const getMe = (req, res) => {
  res.json({
    user: req.user,
    isAuthenticated: true,
  });
};

const register = async (req, res) => {
  const { full_name, email, phone, username, password, address, role } =
    req.body;

  if (!full_name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Full name, email, and password are required" });
  }

  // RBAC Rule: Only CUSTOMER role can self-register
  if (role && role.toUpperCase() !== "CUSTOMER") {
    return res.status(403).json({
      error:
        "Only customers can self-register. Employee accounts (SALESPERSON, INVENTORY_MANAGER) must be created by an administrator.",
      message:
        "Please contact your administrator if you need an employee account.",
    });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });
  }

  try {
    const existingUsers = await authService.findUserByEmailOrUsername(
      email,
      username,
    );
    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email or username already exists" });
    }

    const newUser = await authService.createUser({
      full_name,
      email,
      phone,
      username,
      password,
      address,
    });

    // Generate JWT Token
    const token = generateToken(newUser);

    logActivity(newUser, "REGISTER", "Customer self-registration", req);

    res.status(201).json({
      message: "Customer account created successfully! Please log in.",
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        username: newUser.username || newUser.email,
        role: "CUSTOMER",
        address: newUser.address,
      },
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      // For security, don't reveal if user exists, but here we can be helpful for dev
      return res.status(404).json({ error: "User with this email not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await authService.createOTP(email, otp);

    // Send Real Email
    const emailResult = await sendOTPEmail(email, otp);

    if (emailResult.success) {
        return res.json({ message: "Verification code sent to your email address!" });
    }

    // --- DEVELOPER FALLBACK ---
    // Log to terminal ONLY if real email delivery fails
    console.log("\n" + "!".repeat(50));
    console.log("🛠️  [ERROR] OTP EMAIL DELIVERY FAILED");
    console.log(`📧 TARGET: ${email}`);
    console.log(`🔢 CODE  : ${otp}`);
    console.log(`⚠️  REASON: ${emailResult.error === 'AUTH_FAILED' ? 'Gmail SMTP Authentication Failed' : 'SMTP Configuration Missing'}`);
    console.log("!".repeat(50) + "\n");

    res.json({ 
        message: "We're having trouble sending the email. Please check the backend terminal for your code during development.",
        error: emailResult.error
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error during password reset request" });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const isValid = await authService.verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Email, OTP, and new password are required" });
  }

  try {
    // Double check OTP validity before resetting
    const isValid = await authService.verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await authService.updatePassword(email, newPassword);
    res.json({ message: "Password reset successful! Please log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error during password reset" });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, address } = req.body;

  if (!full_name) {
    return res.status(400).json({ error: "Full name is required" });
  }

  try {
    const { pool } = await import('../config/db.js');
    const result = await pool.query(
      `UPDATE customers
       SET full_name = $1, tel = $2, address = $3
       WHERE customer_id = $4
       RETURNING customer_id, full_name, email, tel, address, created_at`,
      [full_name, phone || null, address || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const updated = result.rows[0];

    // Update localStorage-stored token data via response
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updated.customer_id,
        full_name: updated.full_name,
        email: updated.email,
        phone: updated.tel,
        address: updated.address,
        created_at: updated.created_at,
        role: 'CUSTOMER'
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error updating profile" });
  }
};

export { login, logout, getMe, register, forgotPassword, verifyOTP, resetPassword, updateProfile };
