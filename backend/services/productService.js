import { pool } from '../config/db.js';

const getPublicFabrics = async (filters) => {
    const { category, search, color } = filters;
    let query = "SELECT * FROM fabrics WHERE 1=1";
    const params = [];
    let paramCount = 0;

    if (category && category !== 'All') {
        paramCount++;
        query += ` AND material_type = $${paramCount}`;
        params.push(category);
    }

    if (color && color !== 'All') {
        paramCount++;
        query += ` AND color = $${paramCount}`;
        params.push(color);
    }

    if (search) {
        paramCount++;
        query += ` AND name ILIKE $${paramCount}`;
        params.push(`%${search}%`);
    }

    query += " ORDER BY created_at DESC";

    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (err) {
        throw err;
    }
};

const getPublicFabricById = async (id) => {
    try {
        const result = await pool.query("SELECT * FROM fabrics WHERE fabric_id = $1", [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
        throw err;
    }
};

export {
    getPublicFabrics,
    getPublicFabricById
};
