import express from 'express';
const router = express.Router();
import * as invoiceController from '../controllers/invoiceController.js';
import { isAuthenticated, hasRole } from '../middleware/authMiddleware.js';

const adminOrSales = [isAuthenticated, hasRole(['ADMIN', 'SALESPERSON'])];

// Generation - Customers need to hit this endpoint for their own orders
router.post('/api/invoices/generate/:orderId', isAuthenticated, invoiceController.generateInvoice);

// Retrieval
router.get('/api/invoices', ...adminOrSales, invoiceController.getInvoices);
router.get('/api/invoices/order/:orderId', isAuthenticated, invoiceController.getInvoiceByOrder);

export default router;
