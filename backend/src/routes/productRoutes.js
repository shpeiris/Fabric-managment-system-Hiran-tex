import express from 'express';
const router = express.Router();
import * as productController from '../controllers/productController.js';

// Public routes
router.get('/api/fabrics', productController.getFabrics);
router.get('/api/fabrics/:id', productController.getFabricById);

export default router;
