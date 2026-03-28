import { pool } from "../config/db.js";

export const initStockArrivalModel = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS stock_arrivals (
      arrival_id SERIAL PRIMARY KEY,
      fabric_id INTEGER NOT NULL REFERENCES fabrics(fabric_id) ON DELETE CASCADE,
      supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
      arrival_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      quantity NUMERIC NOT NULL,
      supply_unit_price NUMERIC NOT NULL,
      total_value NUMERIC NOT NULL,
      received_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};
