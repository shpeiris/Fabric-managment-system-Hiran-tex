import express from 'express';
const router = express.Router();
import * as customerController from '../controllers/customerController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

router.get('/api/customer/dashboard-stats', isAuthenticated, customerController.getDashboardStats);
router.get('/api/customer/notifications', isAuthenticated, customerController.getNotifications);
router.post('/api/customer/feedback', isAuthenticated, customerController.submitFeedback);


export default router;
