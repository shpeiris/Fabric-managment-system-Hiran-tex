import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/orderController.js';
import { isAuthenticated, hasRole } from '../middleware/authMiddleware.js';

const adminOrSales = [isAuthenticated, hasRole(['ADMIN', 'SALESPERSON'])];

// Customer routes
router.get('/api/orders', isAuthenticated, orderController.getUserOrders);
router.get('/api/orders/:id', isAuthenticated, orderController.getOrderById); // This Controller handles ownership check
router.post('/api/orders', isAuthenticated, orderController.createCustomerOrder); // Customer creates their own order

// Admin/Sales routes
router.get('/api/sales/orders', ...adminOrSales, orderController.getOrders);
router.post('/api/sales/orders', ...adminOrSales, orderController.createOrder); // Salesperson creates order for user
router.put('/api/sales/orders/:id/status', ...adminOrSales, orderController.updateOrderStatus);
router.get('/api/orders/:id/history', isAuthenticated, orderController.getOrderHistory);

export default router;
