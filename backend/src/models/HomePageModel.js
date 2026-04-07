import { pool } from "../config/db.js";

export const initHomePageModel = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS home_page_settings (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) DEFAULT 'Hiran Fabric Textile',
        hero_title VARCHAR(255) DEFAULT 'Welcome to Hiran Fabric Textile',
        hero_subtitle VARCHAR(255) DEFAULT 'Quality Fabrics for Every Creation',
        hero_button_text VARCHAR(100) DEFAULT 'Get Started',
        hero_image_url VARCHAR(255),
        about_title VARCHAR(255) DEFAULT 'About Us',
        about_content TEXT DEFAULT 'Hiran Fabric Textile is a premier textile business based in Nittambuwa, Sri Lanka, dedicated to providing high-quality fabrics for every creative need. Our commitment to excellence and customer satisfaction sets us apart in the textile industry.',
        contact_address TEXT DEFAULT 'No 72, New Shopping Complex, Nittambuwa',
        contact_phone VARCHAR(50) DEFAULT '+94 77 112 4088',
        contact_email VARCHAR(100) DEFAULT 'hiranfabrictextile@gmail.com',
        contact_hours VARCHAR(255) DEFAULT 'Monday - Saturday, 9:00 AM - 6:00 PM',
        features JSONB DEFAULT '[
            {"title": "Premium Quality", "description": "We source only the finest materials to ensure our fabrics meet the highest quality and durability", "icon_url": null},
            {"title": "Expert Service", "description": "Our knowledgeable staff provides personalized assistance and expert advice to help you find the perfect fabric for your project", "icon_url": null},
            {"title": "Wholesale & Retail", "description": "Flexible purchasing options, catering to both large-scale wholesale orders and individual retail customer", "icon_url": null},
            {"title": "Modern Technology", "description": "Advanced inventory management systems ensure efficient operations and timely delivery", "icon_url": null}
        ]'::JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    await pool.query(query);

    // Seed if empty
    const checkQuery = "SELECT COUNT(*) FROM home_page_settings";
    const { rows } = await pool.query(checkQuery);
    if (parseInt(rows[0].count) === 0) {
        const seedQuery = `
            INSERT INTO home_page_settings (id) VALUES (1);
        `;
        await pool.query(seedQuery);
        console.log(" Seeded default Home Page settings.");
    }
};
