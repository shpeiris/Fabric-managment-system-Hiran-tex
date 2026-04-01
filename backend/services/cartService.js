import { pool } from "../config/db.js";

const getCart = async (customerId) => {
  const query = `
    SELECT c.cart_id, c.quantity, c.created_at, c.total_price,
           f.fabric_id, f.name as fabric_name, f.material_type, f.color, f.price_per_meter, f.stock_quantity as stock_available_quantity, f.image_url
    FROM cart c
    JOIN fabrics f ON c.fabric_id = f.fabric_id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `;
  const result = await pool.query(query, [customerId]);
  return result.rows;
};

const addToCart = async (customerId, fabricId, quantity) => {
  // Check fabric
  const fabricResult = await pool.query(
    "SELECT price_per_meter, stock_quantity FROM fabrics WHERE fabric_id = $1",
    [fabricId]
  );

  if (fabricResult.rows.length === 0)
    throw new Error("Fabric not found");

  const fabric = fabricResult.rows[0];
  if (fabric.stock_quantity < quantity)
    throw new Error("Insufficient stock");

  const totalPrice = fabric.price_per_meter * quantity;

  // Check existing cart item
  const cartResult = await pool.query(
    "SELECT cart_id, quantity FROM cart WHERE user_id = $1 AND fabric_id = $2",
    [customerId, fabricId]
  );

  if (cartResult.rows.length > 0) {
    // Update
    const newQuantity = cartResult.rows[0].quantity + quantity;
    const newTotalPrice = fabric.price_per_meter * newQuantity;

    const updateResult = await pool.query(
      "UPDATE cart SET quantity = $1, total_price = $2 WHERE cart_id = $3 RETURNING cart_id",
      [newQuantity, newTotalPrice, cartResult.rows[0].cart_id]
    );
    return {
      message: "Cart updated",
      cart_id: updateResult.rows[0].cart_id,
    };
  } else {
    // Insert
    const insertResult = await pool.query(
      "INSERT INTO cart (user_id, fabric_id, quantity, total_price) VALUES ($1, $2, $3, $4) RETURNING cart_id",
      [customerId, fabricId, quantity, totalPrice]
    );
    return {
      message: "Added to cart",
      cart_id: insertResult.rows[0].cart_id,
    };
  }
};

const updateCartItem = async (customerId, cartId, quantity) => {
  const cartCheck = await pool.query(
    "SELECT c.fabric_id FROM cart c WHERE c.cart_id = $1 AND c.user_id = $2",
    [cartId, customerId]
  );

  if (cartCheck.rows.length === 0)
    throw new Error("Cart item not found");

  const fabricId = cartCheck.rows[0].fabric_id;

  const fabricResult = await pool.query(
    "SELECT price_per_meter FROM fabrics WHERE fabric_id = $1",
    [fabricId]
  );

  if (fabricResult.rows.length === 0)
    throw new Error("Fabric not found");

  const totalPrice = fabricResult.rows[0].price_per_meter * quantity;

  await pool.query(
    "UPDATE cart SET quantity = $1, total_price = $2 WHERE cart_id = $3",
    [quantity, totalPrice, cartId]
  );
  return { message: "Cart updated" };
};

const removeFromCart = async (customerId, cartId) => {
  const result = await pool.query(
    "DELETE FROM cart WHERE cart_id = $1 AND user_id = $2",
    [cartId, customerId]
  );

  if (result.rowCount === 0)
    throw new Error("Cart item not found");

  return { message: "Item removed" };
};

const getCartCount = async (customerId) => {
  const query = `
    SELECT COALESCE(SUM(quantity), 0) as count
    FROM cart
    WHERE user_id = $1
  `;
  const result = await pool.query(query, [customerId]);
  return { count: parseFloat(result.rows[0].count) };
};

const clearCart = async (customerId) => {
  await pool.query("DELETE FROM cart WHERE user_id = $1", [customerId]);
  return { message: "Cart cleared" };
};

export { getCart, addToCart, updateCartItem, removeFromCart, getCartCount, clearCart };

