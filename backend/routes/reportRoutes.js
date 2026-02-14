import express from 'express';
const router = express.Router();
import * as reportController from '../controllers/reportController.js';
import { isAuthenticated, hasRole } from '../middleware/authMiddleware.js';

const adminOnly = [isAuthenticated, hasRole('ADMIN')];
const adminOrInventoryManager = [isAuthenticated, hasRole(['ADMIN', 'INVENTORY_MANAGER'])];

router.get('/api/reports/sales', ...adminOnly, reportController.getSalesReport);
router.get('/api/reports/inventory', ...adminOrInventoryManager, reportController.getInventoryReport);

export default router;
