import { pool } from "../config/db.js";

export const initFabricModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS fabrics (
      fabric_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      material_type VARCHAR(100),
      color VARCHAR(50),
      design VARCHAR(100),
      price_per_meter NUMERIC NOT NULL CHECK (price_per_meter > 0),
      stock_quantity INTEGER DEFAULT 0,
      stock_available_quantity NUMERIC DEFAULT 0 CHECK (stock_available_quantity >= 0),
      restock_level INTEGER DEFAULT 100,
      restock_date DATE,
      image_url TEXT,
      width VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
