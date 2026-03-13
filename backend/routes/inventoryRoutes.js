import express from 'express';
const router = express.Router();
import * as inventoryController from '../controllers/inventoryController.js';
import { isAuthenticated, isInventoryManager, hasRole } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'fabrics');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images are allowed!"));
    }
});

const inventoryAuth = [isAuthenticated, isInventoryManager];
const adminOrInventoryManager = [isAuthenticated, hasRole(['ADMIN', 'INVENTORY_MANAGER'])];

// Dashboard
router.get('/api/inventory/dashboard', ...adminOrInventoryManager, inventoryController.getDashboard);
router.get('/inventory/fabrics', ...inventoryAuth, inventoryController.getFabrics); // Page render data

// API Routes
router.get('/api/inventory/fabrics', ...adminOrInventoryManager, inventoryController.getInventoryFabrics);
router.post('/api/inventory/fabrics', ...adminOrInventoryManager, upload.single('image'), inventoryController.addFabric);
router.put('/api/inventory/fabrics/:id', ...adminOrInventoryManager, upload.single('image'), inventoryController.updateFabric);
router.delete('/api/inventory/fabrics/:id', ...adminOrInventoryManager, inventoryController.deleteFabric);

router.get('/api/inventory/stock-arrivals', ...adminOrInventoryManager, inventoryController.getStockArrivals);
router.post('/api/inventory/stock-arrivals', ...adminOrInventoryManager, inventoryController.recordStockArrival);

router.get('/api/inventory/suppliers', ...adminOrInventoryManager, inventoryController.getSuppliers);
router.post('/api/inventory/suppliers', ...adminOrInventoryManager, inventoryController.addSupplier);
router.put('/api/inventory/suppliers/:id', ...adminOrInventoryManager, inventoryController.updateSupplier);

export default router;
