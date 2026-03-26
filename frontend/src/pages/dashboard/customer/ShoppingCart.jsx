import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  RefreshCcw, 
  ChevronRight, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react";
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
      setError(null);
      const data = await cartService.getCart();
      setCartItems(data.cart || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load your cart. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 0.01) return;
    
    // Find item to check stock
    const item = cartItems.find(i => i.cart_id === cartId);
    if (item && newQuantity > parseFloat(item.stock_available_quantity)) {
        alert(`Only ${item.stock_available_quantity}m available in stock.`);
        return;
    }

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
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert(err.error || "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartId) => {
    if (!confirm("Remove this premium fabric from your cart?")) return;
    setUpdating(cartId);
    try {
      await cartService.removeFromCart(cartId);
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cartId));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to empty your entire cart?")) return;
    setLoading(true);
    try {
      await cartService.clearCart();
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error("Error clearing cart:", err);
      alert("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price_per_meter || 0);
      const quantity = parseFloat(item.quantity || 0);
      return total + price * quantity;
    }, 0);
  };

  const deliveryFee = cartItems.length > 0 ? 500 : 0;
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee;

  const getImageSrc = (imageUrl) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (!imageUrl) return "/src/assets/Fabrics/fabric-collage.jpg";
    if (imageUrl.startsWith('uploads/')) return `${API_URL}/${imageUrl}`;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `/src/assets/Fabrics/${imageUrl}`;
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="shopping-cart-container">
        <div className="loading-state">
          <Loader2 className="spinner" size={48} />
          <p>Preparing your selection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shopping-cart-container">
        <div className="cart-empty-state">
          <div className="empty-icon-box" style={{ color: '#ef4444', backgroundColor: '#fef2f2' }}>
            <AlertCircle size={48} />
          </div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchCart} className="btn-primary-lg" style={{ width: 'auto' }}>
            <RefreshCcw size={18} /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-cart-container">
      <div className="cart-header">
        <div className="cart-header-title">
          <ShoppingBag size={32} color="#001a66" />
          <h1>My Cart</h1>
          <span className="cart-count-badge">{cartItems.length}</span>
        </div>
        {cartItems.length > 0 && (
          <button onClick={clearCart} className="btn-clear-cart">
            <Trash2 size={16} /> Clear Cart
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <div className="empty-icon-box">
            <ShoppingBag size={48} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any premium fabrics to your collection yet.</p>
          <button
            onClick={() => navigate("/customer/browse")}
            className="btn-primary-lg"
            style={{ width: 'auto' }}
          >
            Start Shopping <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <div className="cart-main-layout">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.cart_id} className="cart-item-card">
                {updating === item.cart_id && (
                  <div className="updating-overlay">
                    <Loader2 className="spinner-sm" />
                  </div>
                )}
                <div className="item-image-container">
                  <img
                    src={getImageSrc(item.image_url)}
                    alt={item.fabric_name}
                    onError={(e) => { e.target.src = "/src/assets/Fabrics/fabric-collage.jpg"; }}
                  />
                </div>

                <div className="item-details">
                  <span className="item-brand">{item.material_type}</span>
                  <h3 className="item-name">{item.fabric_name}</h3>
                  <div className="item-meta">
                    <div className="meta-item">
                      <strong>Color:</strong> {item.color}
                    </div>
                    <div className="meta-item">
                      <strong>SKU:</strong> FAB{item.fabric_id.toString().padStart(3, "0")}
                    </div>
                  </div>
                </div>

                <div className="item-controls">
                  <div className="item-price-info">
                    <span className="unit-price">Rs. {parseFloat(item.price_per_meter).toLocaleString()}/m</span>
                    <span className="total-price">Rs. {(item.quantity * item.price_per_meter).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>

                  <div className="actions-row">
                    <div className="quantity-selector">
                      <button
                        onClick={() => updateQuantity(item.cart_id, parseFloat(item.quantity) - 1)}
                        disabled={updating || parseFloat(item.quantity) <= 1}
                        className="qty-btn"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (val > 0) updateQuantity(item.cart_id, val);
                        }}
                        className="qty-input"
                        disabled={updating}
                      />
                      <button
                        onClick={() => updateQuantity(item.cart_id, parseFloat(item.quantity) + 1)}
                        disabled={updating}
                        className="qty-btn"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.cart_id)}
                      disabled={updating}
                      className="btn-remove"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-section">
            <div className="summary-container">
              <h2>Order Summary</h2>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>Rs. {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="summary-row">
                  <span>Standard Delivery</span>
                  <span>Rs. {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total</span>
                  <span className="grand-total">Rs. {total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>

              <div className="checkout-actions">
                <button
                  onClick={() => navigate("/customer/checkout")}
                  className="btn-primary-lg"
                >
                  Proceed to Checkout <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => navigate("/customer/browse")}
                  className="btn-secondary-lg"
                >
                  <ArrowLeft size={16} /> Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
