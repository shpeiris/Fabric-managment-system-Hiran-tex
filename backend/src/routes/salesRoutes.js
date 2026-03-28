import express from 'express';
const router = express.Router();
import * as salesController from '../controllers/salesController.js';
import { isAuthenticated, isSalesperson, hasRole } from '../middleware/authMiddleware.js';

const salesAuth = [isAuthenticated, isSalesperson];
const adminOrSales = [isAuthenticated, hasRole(['ADMIN', 'SALESPERSON'])];

// Views (Placeholder/Basic data)
router.get('/sales/dashboard', ...salesAuth, salesController.getDashboardView);
router.get('/sales/customers', ...salesAuth, salesController.getCustomersView);

// API Routes
router.get('/api/sales/dashboard', ...adminOrSales, salesController.getDashboard);
router.get('/api/sales/customers', ...adminOrSales, salesController.getCustomers);

// Order Management Routes
router.get('/api/sales/orders', ...adminOrSales, salesController.getOrders);
router.get('/api/sales/pending-verifications', ...adminOrSales, salesController.getPendingVerifications);
router.get('/api/sales/pending-payments', ...adminOrSales, salesController.getPendingPayments);
router.post('/api/sales/verify-order/:id', ...adminOrSales, salesController.verifyOrder);
router.post('/api/sales/send-confirmation', ...adminOrSales, salesController.sendConfirmation);
router.put('/api/sales/orders/:id/status', ...adminOrSales, salesController.updateOrderStatus);

export default router;
