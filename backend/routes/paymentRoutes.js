import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/paymentController.js';
import { isAuthenticated, hasRole } from '../middleware/authMiddleware.js';

const adminOrSales = [isAuthenticated, hasRole(['ADMIN', 'SALESPERSON'])];

router.get('/api/payments', ...adminOrSales, paymentController.getPayments);
router.post('/api/payments/upload-slip', isAuthenticated, paymentController.uploadBankSlip);
router.post('/api/payments/confirm', ...adminOrSales, paymentController.confirmPayment);

export default router;
