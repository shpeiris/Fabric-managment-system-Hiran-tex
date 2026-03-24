import express from "express";
import { getRecentActivities } from "../controllers/activityController.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/admin/activity-logs",
  isAuthenticated,
  isAdmin,
  getRecentActivities,
);

router.get(
  "/admin/dashboard-stats",
  isAuthenticated,
  isAdmin,
  getDashboardStats,
);

export default router;
