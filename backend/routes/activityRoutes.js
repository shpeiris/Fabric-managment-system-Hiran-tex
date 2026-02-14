import express from "express";
import { getRecentActivities } from "../controllers/activityController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/admin/activity-logs",
  isAuthenticated,
  isAdmin,
  getRecentActivities,
);

export default router;
