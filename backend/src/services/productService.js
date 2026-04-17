import { pool } from '../config/db.js';

const getPublicFabrics = async (filters) => {
    const { category, search, color } = filters;
    let query = `
        SELECT f.* 
        FROM fabrics f
        WHERE f.is_in_catalog = true
    `;
    const params = [];
    let paramCount = 0;

    if (category && category !== 'All') {
        paramCount++;
        query += ` AND f.material_type = $${paramCount}`;
        params.push(category);
    }

    if (color && color !== 'All') {
        paramCount++;
        query += ` AND f.color = $${paramCount}`;
        params.push(color);
    }

    if (search) {
        paramCount++;
        query += ` AND f.name ILIKE $${paramCount}`;
        params.push(`%${search}%`);
    }

    query += " ORDER BY f.created_at DESC";

    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (err) {
        throw err;
    }
};

const getPublicFabricById = async (id) => {
    try {
        const query = `
            SELECT f.* 
            FROM fabrics f
            WHERE f.fabric_id = $1 AND f.is_in_catalog = true
        `;
        const result = await pool.query(query, [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
        throw err;
    }
};

export {
    getPublicFabrics,
    getPublicFabricById
};
