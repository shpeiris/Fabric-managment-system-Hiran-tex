import { pool } from "../src/config/db.js";

const updates = [
  { name: 'Satin Stripe Silver', image_url: 'satin_orange.jpg' }, // Mapping orange to silver for variety
  { name: 'Silk Satin Cream', image_url: 'satin_cream.jpg' },
  { name: 'Velvet Crushed Burgundy', image_url: 'satin_maroon.jpg' },
  { name: 'Linen Natural Beige', image_url: 'linen_green.jpg' }
];

async function updateImages() {
  console.log("🚀 Updating fabric images...");
  try {
    for (const update of updates) {
      const result = await pool.query(
        "UPDATE fabrics SET image_url = $1 WHERE name = $2",
        [update.image_url, update.name]
      );
      console.log(`✅ Updated ${update.name}: ${result.rowCount} row(s)`);
    }
  } catch (error) {
    console.error("❌ Error updating images:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateImages();
