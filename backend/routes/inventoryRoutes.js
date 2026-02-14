import express from 'express';
const router = express.Router();
import * as inventoryController from '../controllers/inventoryController.js';
import { isAuthenticated, isInventoryManager, hasRole } from '../middleware/authMiddleware.js';

const inventoryAuth = [isAuthenticated, isInventoryManager];
const adminOrInventoryManager = [isAuthenticated, hasRole(['ADMIN', 'INVENTORY_MANAGER'])];

// Dashboard
router.get('/api/inventory/dashboard', ...adminOrInventoryManager, inventoryController.getDashboard);
router.get('/inventory/fabrics', ...inventoryAuth, inventoryController.getFabrics); // Page render data

// API Routes
router.get('/api/inventory/fabrics', ...adminOrInventoryManager, inventoryController.getInventoryFabrics);
router.post('/api/inventory/fabrics', ...adminOrInventoryManager, inventoryController.addFabric);
router.put('/api/inventory/fabrics/:id', ...adminOrInventoryManager, inventoryController.updateFabric);
router.delete('/api/inventory/fabrics/:id', ...adminOrInventoryManager, inventoryController.deleteFabric);

router.get('/api/inventory/stock-arrivals', ...adminOrInventoryManager, inventoryController.getStockArrivals);
router.post('/api/inventory/stock-arrivals', ...adminOrInventoryManager, inventoryController.recordStockArrival);

router.get('/api/inventory/suppliers', ...adminOrInventoryManager, inventoryController.getSuppliers);
router.post('/api/inventory/suppliers', ...adminOrInventoryManager, inventoryController.addSupplier);
router.put('/api/inventory/suppliers/:id', ...adminOrInventoryManager, inventoryController.updateSupplier);

export default router;
