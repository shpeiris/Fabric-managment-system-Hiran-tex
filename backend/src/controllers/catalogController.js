import { pool } from "../config/db.js";

export const addToCatalog = async (req, res) => {
  const { fabricId, catalogId = 1 } = req.body;
  if (!fabricId) {
    return res.status(400).json({ error: "Fabric ID is required" });
  }

  try {
    const existing = await pool.query(
      "SELECT * FROM catalog_items WHERE catalog_id = $1 AND fabric_id = $2",
      [catalogId, fabricId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Fabric already in catalog" });
    }

    await pool.query(
      "INSERT INTO catalog_items (catalog_id, fabric_id) VALUES ($1, $2)",
      [catalogId, fabricId]
    );

    res.status(201).json({ message: "Fabric added to catalog successfully" });
  } catch (error) {
    console.error("Error adding to catalog:", error);
    res.status(500).json({ error: "Failed to add to catalog" });
  }
};

export const removeFromCatalog = async (req, res) => {
  const { fabricId, catalogId = 1 } = req.body;
  if (!fabricId) {
    return res.status(400).json({ error: "Fabric ID is required" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM catalog_items WHERE catalog_id = $1 AND fabric_id = $2",
      [catalogId, fabricId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Fabric not found in catalog" });
    }

    res.json({ message: "Fabric removed from catalog successfully" });
  } catch (error) {
    console.error("Error removing from catalog:", error);
    res.status(500).json({ error: "Failed to remove from catalog" });
  }
};

export const getCatalogStatus = async (req, res) => {
  const { catalogId = 1 } = req.query;
  try {
    const result = await pool.query(
      "SELECT fabric_id FROM catalog_items WHERE catalog_id = $1",
      [catalogId]
    );
    const fabricIds = result.rows.map(row => row.fabric_id);
    res.json({ fabricIds });
  } catch (error) {
    console.error("Error getting catalog status:", error);
    res.status(500).json({ error: "Failed to get catalog status" });
  }
};
