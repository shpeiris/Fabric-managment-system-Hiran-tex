import express from "express";
import { getHomePageSettings, updateHomePageSettings } from "../controllers/HomePageController.js";
import { isAuthenticated, isAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'home');
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// Publicly accessible to show on the landing page
router.get("/", getHomePageSettings);

// Admin-only access to update the content and images
router.put(
    "/", 
    isAuthenticated, 
    isAdmin, 
    upload.fields([
        { name: 'hero_image', maxCount: 1 },
        { name: 'feature_0', maxCount: 1 },
        { name: 'feature_1', maxCount: 1 },
        { name: 'feature_2', maxCount: 1 },
        { name: 'feature_3', maxCount: 1 }
    ]),
    updateHomePageSettings
);

export default router;
