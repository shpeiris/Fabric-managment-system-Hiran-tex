import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const removeCatalogData = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("Cleaning up existing fabric data from database...");
        // Truncate tables with dependencies
        // cart, order_items, stock_arrivals, fabrics
        await client.query('TRUNCATE TABLE cart, order_items, stock_arrivals, fabrics CASCADE');

        await client.query('COMMIT');
        console.log("Successfully cleared fabric tables in database.");

        console.log("Cleaning up uploaded fabric images...");
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'fabrics');
        
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            let deletedCount = 0;
            for (const file of files) {
                // Keep .gitkeep if it exists
                if (file === '.gitkeep') continue;
                
                const filePath = path.join(uploadsDir, file);
                fs.unlinkSync(filePath);
                deletedCount++;
            }
            console.log(`Successfully deleted ${deletedCount} images from ${uploadsDir}.`);
        } else {
            console.log("Uploads directory not found, skipping file cleanup.");
        }

        console.log("Fabric catalog data removal complete!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error removing catalog data:", err);
    } finally {
        client.release();
        process.exit();
    }
};

removeCatalogData();
