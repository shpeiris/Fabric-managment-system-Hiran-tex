import express from "express";
import { addToCatalog, removeFromCatalog, getCatalogStatus } from "../controllers/catalogController.js";
import { isAuthenticated, hasRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const adminOrInventoryManager = [isAuthenticated, hasRole(['ADMIN', 'INVENTORY_MANAGER'])];

router.post("/api/inventory/catalog/add", ...adminOrInventoryManager, addToCatalog);
router.post("/api/inventory/catalog/remove", ...adminOrInventoryManager, removeFromCatalog);
router.get("/api/inventory/catalog/status", ...adminOrInventoryManager, getCatalogStatus);

export default router;
