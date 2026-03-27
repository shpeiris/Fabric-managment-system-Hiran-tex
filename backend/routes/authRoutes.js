import express from "express";
const router = express.Router();
import * as authController from "../controllers/authController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/auth/me", isAuthenticated, authController.getMe);
router.post("/register", authController.register);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOTP);
router.post("/reset-password", authController.resetPassword);
router.patch("/api/customer/profile", isAuthenticated, authController.updateProfile);

export default router;
