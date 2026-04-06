import { verifyToken } from "../utils/jwtHelper.js";

// Authentication middleware - Check if user is logged in
const isAuthenticated = (req, res, next) => {
  // 1. Check Session
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // 2. Check JWT Token (Authorization: Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  return res.status(401).json({ error: "Authentication required" });
};

// Role-based authorization middleware
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Convert single role to array for consistency
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: "Access denied. Insufficient permissions.",
      required_roles: allowedRoles,
      user_role: req.user.role,
    });
  };
};

// Admin only middleware
const isAdmin = hasRole("ADMIN");

// Inventory manager or admin middleware
const isInventoryManager = hasRole(["INVENTORY_MANAGER", "INVENTORY", "ADMIN"]);

// Salesperson or admin middleware
const isSalesperson = hasRole(["SALESPERSON", "SALES", "ADMIN"]);

// Customer or admin middleware
const isCustomer = hasRole(["CUSTOMER", "ADMIN"]);

export {
  isAuthenticated,
  hasRole,
  isAdmin,
  isInventoryManager,
  isSalesperson,
  isCustomer,
};
