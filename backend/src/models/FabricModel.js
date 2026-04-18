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
      is_in_catalog BOOLEAN DEFAULT true,
      reorder_level INTEGER DEFAULT 50,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Ensure is_in_catalog exists if the table was already created
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fabrics' AND column_name='is_in_catalog') THEN
        ALTER TABLE fabrics ADD COLUMN is_in_catalog BOOLEAN DEFAULT true;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fabrics' AND column_name='reorder_level') THEN
        ALTER TABLE fabrics ADD COLUMN reorder_level INTEGER DEFAULT 50;
      END IF;
    END $$;

    -- Seed some initial fabrics if empty
    const fabricCount = await pool.query("SELECT COUNT(*) FROM fabrics");
    if (parseInt(fabricCount.rows[0].count) === 0) {
      console.log("🌱 Seeding demo fabrics...");
      const demoFabrics = [
        ['Linen Cotton Mix', 'Linen', 'Green', 'Plain', 1250, 150, 140, '36"', true, 50],
        ['Premium Satin Silk', 'Satin', 'Maroon', 'Glossy', 1850, 80, 75, '45"', true, 30],
        ['Comfort Cotton', 'Cotton', 'Blue', 'Striped', 950, 200, 190, '36"', true, 100]
      ];
      
      for (const f of demoFabrics) {
        await pool.query(
          "INSERT INTO fabrics (name, material_type, color, design, price_per_meter, stock_quantity, stock_available_quantity, width, is_in_catalog, reorder_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          f
        );
      }
      console.log("✅ Demo fabrics seeded.");
    }
  `;
  await pool.query(query);
};
