import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cartService from "../../../services/cartService";
import "./ShoppingCart.css";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCartItems(data.cart || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdating(cartId);
    try {
      await cartService.updateCartItem(cartId, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cartId
            ? { ...item, quantity: newQuantity, total_price: newQuantity * parseFloat(item.price_per_meter) }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartId) => {
    if (!confirm("Remove this item from cart?")) return;
    setUpdating(cartId);
    try {
      await cartService.removeFromCart(cartId);
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cartId));
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setUpdating(null);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price_per_meter || 0);
      const quantity = parseFloat(item.quantity || 0);
      return total + price * quantity;
    }, 0);
  };

  if (loading) return (
    <div className="shopping-cart-container">
      <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading cart...</div>
    </div>
  );

  if (error) return (
    <div className="shopping-cart-container">
      <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
        <p>{error}</p>
        <button onClick={fetchCart} style={{ marginTop: '12px', padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="shopping-cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p className="cart-count">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some fabrics to get started!</p>
          <button
            onClick={() => navigate("/customer/browse")}
            className="btn-continue-shopping"
          >
            Browse Fabrics
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items-section">
            {cartItems.map((item) => (
              <div key={item.cart_id} className="cart-item-card">
                <div className="cart-item-info">
                  <div className="item-main-header">
                    <span className="item-material-badge">
                      {item.material_type}
                    </span>
                    <h3 className="item-name">{item.fabric_name}</h3>
                    <p className="item-sku">
                      SKU: FAB{item.fabric_id.toString().padStart(3, "0")}
                    </p>
                  </div>

                  <div className="item-specs">
                    <div className="spec-unit">
                      <span className="spec-label">Color</span>
                      <span className="spec-value">{item.color}</span>
                    </div>
                    <div className="spec-unit">
                      <span className="spec-label">Price</span>
                      <span className="spec-value">
                        Rs. {parseFloat(item.price_per_meter).toFixed(2)}/m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="item-controls-section">
                  <div className="quantity-panel">
                    <label>Order Quantity</label>
                    <div className="qty-stepper">
                      <button
                        onClick={() =>
                          updateQuantity(item.cart_id, item.quantity - 1)
                        }
                        disabled={updating || item.quantity <= 1}
                        className="stepper-btn"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (val > 0) updateQuantity(item.cart_id, val);
                        }}
                        min="0.01"
                        disabled={updating}
                        className="stepper-input"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item.cart_id, item.quantity + 1)
                        }
                        disabled={updating}
                        className="stepper-btn"
                      >
                        +
                      </button>
                      <span className="stepper-unit">meters</span>
                    </div>
                  </div>

                  <div className="item-subtotal-panel">
                    <span className="panel-label">Subtotal</span>
                    <span className="panel-amount">
                      Rs.{" "}
                      {(
                        parseFloat(item.price_per_meter) * item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeItem(item.cart_id)}
                    disabled={updating}
                    className="item-delete-btn"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary-card">
              <h2>Order Summary</h2>

              <div className="summary-items-list">
                {cartItems.map((item) => (
                  <div key={item.cart_id} className="summary-item-detail">
                    <span className="summary-item-name">
                      {item.fabric_name} ({parseFloat(item.quantity).toFixed(2)}m)
                    </span>
                    <span className="summary-item-price">
                      Rs. {(parseFloat(item.price_per_meter) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>
                  Subtotal ({cartItems.length}{" "}
                  {cartItems.length === 1 ? "item" : "items"})
                </span>
                <span>Rs. {calculateTotal().toFixed(2)}</span>
              </div>


              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total</span>
                <span className="total-amount">
                  Rs. {calculateTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => navigate("/customer/checkout")}
                className="btn-checkout"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/customer/browse")}
                className="btn-continue"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
