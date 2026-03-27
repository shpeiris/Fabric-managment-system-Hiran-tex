import express from "express";
const router = express.Router();
import * as cartController from "../controllers/cartController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

router.get("/api/cart", isAuthenticated, cartController.getCart);
router.post("/api/cart", isAuthenticated, cartController.addToCart);
router.put("/api/cart/:id", isAuthenticated, cartController.updateCartItem);
router.delete("/api/cart/:id", isAuthenticated, cartController.removeFromCart);

router.get("/api/cart/count", isAuthenticated, cartController.getCartCount);
router.delete("/api/cart", isAuthenticated, cartController.clearCart);

export default router;

