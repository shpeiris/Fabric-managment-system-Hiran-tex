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

  const subtotal = calculateSubtotal();

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
    <div className="shopping-cart-wrapper">
      <div className="cart-container-inner">
        <div className="cart-header-section">
          <div className="cart-title-block">
            <ShoppingBag className="title-icon" size={32} />
            <div>
              <h1>Shopping Collection</h1>
              <p>You have {cartItems.length} premium individual {cartItems.length === 1 ? 'fabric' : 'fabrics'} in your selection.</p>
            </div>
          </div>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className="btn-ghost-danger">
              <Trash2 size={16} /> Reset Selection
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state-card">
            <div className="empty-illustration">
               <ShoppingBag size={64} className="floating-bag" />
            </div>
            <h2>Your collection is empty</h2>
            <p>Start exploring our premium fabric catalog to find your next masterpiece.</p>
            <button
              onClick={() => navigate("/customer/browse")}
              className="btn-premium-action"
            >
              Explore Catalog <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="cart-responsive-grid">
            {/* Left side: Items */}
            <div className="cart-items-column">
              {cartItems.map((item) => (
                <div key={item.cart_id} className="premium-cart-item">
                  {updating === item.cart_id && (
                    <div className="item-loading-overlay">
                      <Loader2 className="spinner-animate" />
                    </div>
                  )}
                  <div className="item-image-box">
                    <img
                      src={getImageSrc(item.image_url)}
                      alt={item.fabric_name}
                      onError={(e) => { e.target.src = "/src/assets/Fabrics/fabric-collage.jpg"; }}
                    />
                  </div>

                  <div className="item-info-box">
                    <div className="item-identity">
                      <span className="fabric-category">{item.material_type}</span>
                      <h3 className="fabric-name">{item.fabric_name}</h3>
                      <div className="fabric-specs">
                        <span><strong>Color:</strong> {item.color}</span>
                        <span className="spec-divider">|</span>
                        <span><strong>SKU:</strong> FAB{item.fabric_id.toString().padStart(3, "0")}</span>
                      </div>
                    </div>

                    <div className="item-financials">
                      <div className="price-tag">
                        <span className="unit-label">Price per meter</span>
                        <span className="price-value">Rs. {parseFloat(item.price_per_meter).toLocaleString()}</span>
                      </div>
                      <div className="item-total-block">
                        <span className="total-label">Subtotal</span>
                        <span className="total-value-main">Rs. {(item.quantity * item.price_per_meter).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>

                    <div className="item-interaction-row">
                      <div className="premium-qty-selector">
                        <button
                          onClick={() => updateQuantity(item.cart_id, parseFloat(item.quantity) - 0.5)}
                          disabled={updating || parseFloat(item.quantity) <= 0.5}
                          className="qty-action-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <div className="qty-display">
                          <input
                            type="number"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (val > 0) updateQuantity(item.cart_id, val);
                            }}
                            className="qty-numeric-input"
                            disabled={updating}
                          />
                          <span className="qty-unit">m</span>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.cart_id, parseFloat(item.quantity) + 0.5)}
                          disabled={updating}
                          className="qty-action-btn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.cart_id)}
                        disabled={updating}
                        className="btn-trash-circular"
                        title="Remove from collection"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side: Summary */}
            <div className="cart-summary-column">
              <div className="sticky-summary-card">
                <h3>Order Insight</h3>
                <div className="summary-detail-list">
                  <div className="detail-row">
                    <span className="detail-label">Quantity ({cartItems.length} styles)</span>
                    <span className="detail-value">Total {cartItems.reduce((acc, i) => acc + parseFloat(i.quantity), 0).toFixed(1)}m</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ex-Factory Subtotal</span>
                    <span className="detail-value">Rs. {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="detail-row info">
                    <span className="detail-label">Delivery & Taxes</span>
                    <span className="detail-value highlight">Calculated at Checkout</span>
                  </div>
                  
                  <div className="total-separator"></div>
                  
                  <div className="grand-total-row">
                    <span className="grand-label">Estimated Total</span>
                    <span className="grand-value">Rs. {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                <div className="action-stack">
                  <button
                    onClick={() => navigate("/customer/checkout")}
                    className="btn-checkout-primary"
                  >
                    Proceed to Verification <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={() => navigate("/customer/browse")}
                    className="btn-link-return"
                  >
                    <ArrowLeft size={16} /> Add More Fabrics
                  </button>
                </div>
                
                <div className="secure-checkout-badge">
                  <span className="badge-icon">🔒</span>
                  <span>Secure Checkout & Encrypted Connection</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
