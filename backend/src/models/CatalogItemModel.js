import { pool } from "../config/db.js";

export const initCatalogItemModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS catalog_items (
      catalog_id INTEGER REFERENCES catalogs(catalog_id) ON DELETE CASCADE,
      fabric_id INTEGER REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (catalog_id, fabric_id)
    );
  `;
  await pool.query(query);
};
