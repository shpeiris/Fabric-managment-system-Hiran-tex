import { pool } from "../config/db.js";

const getDashboardStats = async () => {
  const statsQuery = `
    SELECT 
      (SELECT COALESCE(SUM(stock_quantity * price_per_meter), 0) FROM fabrics) as total_stock_value,
      (SELECT COUNT(*) FROM fabrics WHERE stock_quantity <= reorder_level) as low_stock_items,
      (SELECT COUNT(*) FROM fabrics) as total_fabrics,
      (SELECT COUNT(*) FROM stock_arrivals WHERE arrival_date >= NOW() - INTERVAL '7 days') as recent_arrivals
  `;
  const result = await pool.query(statsQuery);
  const row = result.rows[0];

  return {
    totalStockValue: parseFloat(row.total_stock_value),
    lowStockItems: parseInt(row.low_stock_items),
    totalFabrics: parseInt(row.total_fabrics),
    recentArrivals: parseInt(row.recent_arrivals)
  };
};

const getInventoryFabrics = async () => {
  const query = `
    SELECT f.*, 
           CASE 
             WHEN f.stock_quantity = 0 THEN 'OUT_OF_STOCK'
             WHEN f.stock_quantity <= f.reorder_level THEN 'LOW'
             ELSE 'OK'
           END as stock_status
     FROM fabrics f
     ORDER BY f.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const addFabric = async (fabricData) => {
  const {
    name,
    material_type,
    color,
    design,
    price_per_meter,
    stock_quantity,
    reorder_level,
    image_url,
    restock_date
  } = fabricData;

  const query = `
    INSERT INTO fabrics (name, material_type, color, design, price_per_meter, 
                        stock_quantity, reorder_level, image_url, restock_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING fabric_id
  `;

  const result = await pool.query(query, [
    name,
    material_type,
    color,
    design,
    price_per_meter,
    stock_quantity || 0,
    reorder_level || 50,
    image_url || null,
    restock_date || null
  ]);

  return { fabric_id: result.rows[0].fabric_id, ...fabricData };
};

const updateFabric = async (id, fabricData) => {
  const {
    name,
    material_type,
    color,
    design,
    price_per_meter,
    stock_quantity,
    reorder_level,
    image_url,
    restock_date,
  } = fabricData;

  const query = `
    UPDATE fabrics 
    SET name = $1, material_type = $2, color = $3, design = $4, 
        price_per_meter = $5, stock_quantity = $6, reorder_level = $7, 
        image_url = $8, restock_date = $9
    WHERE fabric_id = $10
  `;

  const result = await pool.query(query, [
    name,
    material_type,
    color,
    design,
    price_per_meter,
    stock_quantity,
    reorder_level,
    image_url || null,
    restock_date || null,
    id
  ]);

  if (result.rowCount === 0) return null;
  return { fabric_id: id, ...fabricData };
};

const deleteFabric = async (id) => {
  const result = await pool.query("DELETE FROM fabrics WHERE fabric_id = $1", [id]);
  return result.rowCount > 0;
};

const getStockArrivals = async () => {
  const query = `
    SELECT sa.*, f.name as fabric_name, f.material_type, s.name as supplier_name, e.full_name as received_by_name
    FROM stock_arrivals sa
    JOIN fabrics f ON sa.fabric_id = f.fabric_id
    JOIN suppliers s ON sa.supplier_id = s.supplier_id
    LEFT JOIN employees e ON sa.received_by = e.employee_id
    ORDER BY sa.arrival_date DESC
    LIMIT 50
  `;
  const result = await pool.query(query);
  return result.rows;
};

const recordStockArrival = async (data) => {
  const { fabric_id, supplier_id, arrival_date, quantity, supply_unit_price, received_by } = data;
  const total_value = supply_unit_price * quantity;

  try {
    await pool.query('BEGIN');

    const insertQuery = `
      INSERT INTO stock_arrivals (fabric_id, supplier_id, arrival_date, quantity, supply_unit_price, total_value, received_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING arrival_id
    `;

    const res = await pool.query(insertQuery, [
      fabric_id,
      supplier_id,
      arrival_date || new Date(),
      quantity,
      supply_unit_price,
      total_value,
      received_by || null
    ]);

    const arrivalId = res.rows[0].arrival_id;

    const updateQuery = `
      UPDATE fabrics 
      SET stock_available_quantity = stock_available_quantity + $1,
          stock_quantity = stock_quantity + $1
      WHERE fabric_id = $2
    `;

    await pool.query(updateQuery, [quantity, fabric_id]);

    await pool.query('COMMIT');
    return { arrival_id: arrivalId };
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }
};

const getSuppliers = async () => {
  const result = await pool.query("SELECT * FROM suppliers ORDER BY name");
  return result.rows;
};

const addSupplier = async (data) => {
  const { name, contact_person, contact_number, email, address } = data;
  const query = `
    INSERT INTO suppliers (name, contact_person, contact_number, email, address)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING supplier_id
  `;
  const result = await pool.query(query, [name, contact_person, contact_number, email, address]);
  return { supplier_id: result.rows[0].supplier_id, ...data };
};

const updateSupplier = async (id, data) => {
  const { name, contact_person, contact_number, email, address } = data;
  const query = `
    UPDATE suppliers 
    SET name = $1, contact_person = $2, contact_number = $3, email = $4, address = $5
    WHERE supplier_id = $6
  `;
  const result = await pool.query(query, [name, contact_person, contact_number, email, address, id]);
  if (result.rowCount === 0) return null;
  return { supplier_id: id, ...data };
};

const deleteSupplier = async (id) => {
  const result = await pool.query("DELETE FROM suppliers WHERE supplier_id = $1", [id]);
  return result.rowCount > 0;
};

export {
  getDashboardStats,
  getInventoryFabrics,
  addFabric,
  updateFabric,
  deleteFabric,
  getStockArrivals,
  recordStockArrival,
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
};
