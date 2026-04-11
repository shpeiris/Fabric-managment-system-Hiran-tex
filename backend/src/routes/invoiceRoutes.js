import express from 'express';
const router = express.Router();
import * as invoiceController from '../controllers/invoiceController.js';
import { isAuthenticated, hasRole } from '../middleware/authMiddleware.js';

const adminOrSales = [isAuthenticated, hasRole(['ADMIN', 'SALES'])];

// Generation
router.post('/api/invoices/generate/:orderId', ...adminOrSales, invoiceController.generateInvoice);

// Retrieval
router.get('/api/invoices', ...adminOrSales, invoiceController.getInvoices);
router.get('/api/invoices/order/:orderId', isAuthenticated, invoiceController.getInvoiceByOrder);

export default router;
