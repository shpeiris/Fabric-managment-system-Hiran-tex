import { pool } from "../config/db.js";

export const initCatalogModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS catalogs (
      catalog_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
