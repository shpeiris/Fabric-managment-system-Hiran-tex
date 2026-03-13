import { pool } from '../config/db.js';

const refreshCatalog = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log("Cleaning up existing fabric data...");
        // Truncate tables with dependencies
        await client.query('TRUNCATE TABLE cart, order_items, stock_arrivals, fabrics CASCADE');

        console.log("Seeding new Hiran Tex Catalog...");

        const fabrics = [
            {
                name: "Premium Linen Cotton Blend",
                material_type: "Linen/Cotton",
                color: "Natural Beige",
                design: "Plain",
                price: 850.00,
                stock: 250,
                reorder: 50,
                image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
                width: "45 inch"
            },
            {
                name: "Pure Silk Satin",
                material_type: "Silk",
                color: "Royal Blue",
                design: "Satin Finish",
                price: 1350.00,
                stock: 120,
                reorder: 30,
                image: "https://images.unsplash.com/photo-1597484662317-c87d32cf25b8?w=800",
                width: "42 inch"
            },
            {
                name: "Floral Soft Rayon",
                material_type: "Rayon",
                color: "Multicolor/Pink",
                design: "Floral Print",
                price: 480.00,
                stock: 500,
                reorder: 100,
                image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800",
                width: "58 inch"
            },
            {
                name: "Classic Denim 12oz",
                material_type: "Cotton/Denim",
                color: "Dark Indigo",
                design: "Twill",
                price: 950.00,
                stock: 300,
                reorder: 60,
                image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
                width: "60 inch"
            },
            {
                name: "Lightweight Georgette",
                material_type: "Synthetic",
                color: "Soft Lavender",
                design: "Sheer",
                price: 520.00,
                stock: 450,
                reorder: 80,
                image: "https://images.unsplash.com/photo-1583091930067-2dd95c372131?w=800",
                width: "44 inch"
            },
            {
                name: "Cotton Poplin",
                material_type: "Cotton",
                color: "Snow White",
                design: "Solid",
                price: 380.00,
                stock: 600,
                reorder: 150,
                image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
                width: "45 inch"
            },
            {
                name: "Luxury Velvet",
                material_type: "Synthetic/Velvet",
                color: "Emerald Green",
                design: "Plush",
                price: 1100.00,
                stock: 80,
                reorder: 25,
                image: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=800",
                width: "54 inch"
            }
        ];

        for (const f of fabrics) {
            await client.query(
                `INSERT INTO fabrics (name, material_type, color, design, price_per_meter, stock_quantity, stock_available_quantity, reorder_level, image_url, width) 
                 VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9)`,
                [f.name, f.material_type, f.color, f.design, f.price, f.stock, f.reorder, f.image, f.width]
            );
        }

        await client.query('COMMIT');
        console.log("Successfully refreshed catalog with Hiran Tex fabrics!");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Error refreshing catalog:", err);
    } finally {
        client.release();
        process.exit();
    }
};

refreshCatalog();
