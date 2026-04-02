import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { isAuthenticated, isAdmin } from '../middleware/authMiddleware.js';

// All routes here are for Admin
router.post('/admin/users', isAuthenticated, isAdmin, userController.createUser);
router.get('/admin/users', isAuthenticated, isAdmin, userController.getAllUsers);
router.patch('/admin/users/:id/status', isAuthenticated, isAdmin, userController.updateUserStatus);
router.delete('/admin/users/:email', isAuthenticated, isAdmin, userController.deleteUser);

export default router;
