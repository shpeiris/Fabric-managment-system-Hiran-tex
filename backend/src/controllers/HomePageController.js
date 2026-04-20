import { pool } from "../config/db.js";

export const getHomePageSettings = async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM home_page_settings WHERE id = 1");
        if (rows.length === 0) {
            return res.status(404).json({ error: "Settings not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching home page settings:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateHomePageSettings = async (req, res) => {
    try {
        const {
            company_name,
            hero_title,
            hero_subtitle,
            hero_button_text,
            about_title,
            about_content,
            contact_address,
            contact_phone,
            contact_email,
            contact_hours
        } = req.body;

        if (contact_phone && !/^\d{10}$/.test(contact_phone)) {
            return res.status(400).json({ error: "Contact telephone must be exactly 10 digits" });
        }

        // Features will be sent as a JSON string in FormData
        let features = [];
        try {
            features = JSON.parse(req.body.features || '[]');
        } catch (e) {
            console.error("Error parsing features JSON:", e);
        }

        // Handle uploaded files
        const files = req.files || {};
        let hero_image_url = req.body.hero_image_url; // Use existing value from body if provided

        if (files['hero_image']) {
            hero_image_url = `/uploads/home/${files['hero_image'][0].filename}`;
        }

        // Feature icons: check for feature_0, feature_1, etc.
        for (let i = 0; i < 4; i++) {
            const fieldName = `feature_${i}`;
            if (files[fieldName]) {
                if (features[i]) {
                    features[i].icon_url = `/uploads/home/${files[fieldName][0].filename}`;
                }
            }
        }

        const query = `
            UPDATE home_page_settings
            SET 
                company_name = $1,
                hero_title = $2,
                hero_subtitle = $3,
                hero_button_text = $4,
                about_title = $5,
                about_content = $6,
                contact_address = $7,
                contact_phone = $8,
                contact_email = $9,
                contact_hours = $10,
                features = $11,
                hero_image_url = $12,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
            RETURNING *;
        `;

        const values = [
            company_name,
            hero_title,
            hero_subtitle,
            hero_button_text,
            about_title,
            about_content,
            contact_address,
            contact_phone,
            contact_email,
            contact_hours,
            JSON.stringify(features),
            hero_image_url
        ];

        const { rows } = await pool.query(query, values);
        res.json(rows[0]);
    } catch (error) {
        console.error("Error updating home page settings:", error);
        res.status(500).json({ error: "Server error" });
    }
};
