import express from 'express';
const router = express.Router();
import * as reportController from '../controllers/reportController.js';
import { isAuthenticated, hasRole } from '../middleware/authMiddleware.js';

const adminOnly = [isAuthenticated, hasRole('ADMIN')];
const adminOrInventoryManager = [isAuthenticated, hasRole(['ADMIN', 'INVENTORY_MANAGER', 'SALESPERSON'])];
const allStaff = [isAuthenticated, hasRole(['ADMIN', 'INVENTORY_MANAGER', 'SALESPERSON'])];

router.get('/api/reports/sales', ...allStaff, reportController.getSalesReport);
router.get('/api/reports/inventory', ...allStaff, reportController.getInventoryReport);
router.get('/api/reports/suppliers', ...allStaff, reportController.getSupplierReport);

export default router;
