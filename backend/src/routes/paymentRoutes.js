import express from 'express';
const router = express.Router();
import * as paymentController from '../controllers/paymentController.js';
import { isAuthenticated, hasRole } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'slips');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slip-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only images and PDFs are allowed!"));
    }
});

const adminOrSales = [isAuthenticated, hasRole(['ADMIN', 'SALESPERSON'])];

router.get('/api/payments', ...adminOrSales, paymentController.getPayments);
router.post('/api/payments/upload-slip', isAuthenticated, upload.single('slip'), paymentController.uploadBankSlip);
router.post('/api/payments/confirm', ...adminOrSales, paymentController.confirmPayment);

export default router;
