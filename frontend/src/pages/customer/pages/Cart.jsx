import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../utils/auth.js';
import { Trash2, Plus, Minus } from 'lucide-react';
import fabric1 from "../../../assets/Fabrics/lasecotton.png";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // cart_id being updated

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await apiCall(`${API}/api/cart`);
      const data = await res.json();
      if (res.ok) {
        setCartItems(data.cart || []);
      } else {
        setError(data.error || 'Failed to load cart');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 0.01) return;
    setUpdating(cartId);
    try {
      const res = await apiCall(`${API}/api/cart/${cartId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (res.ok) {
        setCartItems(items =>
          items.map(item =>
            item.cart_id === cartId
              ? { ...item, quantity: newQuantity, total_price: newQuantity * item.price_per_meter }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartId) => {
    setUpdating(cartId);
    try {
      const res = await apiCall(`${API}/api/cart/${cartId}`, { method: 'DELETE' });
      if (res.ok) {
        setCartItems(items => items.filter(item => item.cart_id !== cartId));
      }
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      setUpdating(null);
    }
  };

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return fabric1;
    if (imageUrl.startsWith('uploads/')) return `${API}/${imageUrl}`;
    if (imageUrl.startsWith('http')) return imageUrl;
    return fabric1;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  const total = subtotal;

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛒</div>
      <p>Loading your cart...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
      <p>{error}</p>
      <button onClick={fetchCart} style={{ marginTop: '12px', padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>Shopping Cart</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>
        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Cart Items */}
        <div>
          {cartItems.map(item => (
            <div key={item.cart_id} style={{
              background: 'white', border: '1px solid #e5e7eb',
              borderRadius: '8px', padding: '20px', marginBottom: '15px',
              display: 'flex', gap: '20px',
              opacity: updating === item.cart_id ? 0.6 : 1,
              transition: 'opacity 0.2s'
            }}>
              <img
                src={getImageSrc(item.image_url)}
                alt={item.fabric_name}
                onError={(e) => { e.target.src = fabric1; }}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{item.fabric_name}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{item.material_type} · {item.color}</p>
                <p style={{ fontSize: '15px', color: '#2563eb', fontWeight: '600' }}>Rs. {parseFloat(item.price_per_meter).toLocaleString()}/m</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <button
                  onClick={() => removeItem(item.cart_id)}
                  disabled={updating === item.cart_id}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}
                  title="Remove item"
                >
                  <Trash2 size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => updateQuantity(item.cart_id, Math.round((parseFloat(item.quantity) - 1) * 100) / 100)}
                    disabled={updating === item.cart_id || parseFloat(item.quantity) <= 1}
                    style={{ background: '#f3f4f6', border: 'none', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={item.quantity}
                    onChange={(e) => {
                      let val = parseFloat(e.target.value);
                      if (val > 0) {
                        // Enforce 2 decimal places
                        val = Math.round(val * 100) / 100;
                        updateQuantity(item.cart_id, val);
                      }
                    }}
                    style={{ 
                      width: '80px', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '4px', 
                      padding: '4px',
                      textAlign: 'center', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#1f2937'
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>m</span>
                  <button
                    onClick={() => updateQuantity(item.cart_id, Math.round((parseFloat(item.quantity) + 1) * 100) / 100)}
                    disabled={updating === item.cart_id}
                    style={{ background: '#f3f4f6', border: 'none', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>
                  Rs. {parseFloat(item.total_price || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>Your cart is empty</p>
              <button
                onClick={() => navigate('/customer/browse')}
                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
              >
                Browse Fabrics
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', position: 'sticky', top: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Order Summary</h3>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal ({cartItems.length} items)</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Rs. {subtotal.toFixed(2)}</span>
              </div>

            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>Rs. {total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate('/customer/checkout')}
              disabled={cartItems.length === 0}
              style={{
                background: cartItems.length === 0 ? '#d1d5db' : '#001a66',
                color: 'white', border: 'none', padding: '16px', borderRadius: '8px',
                fontSize: '15px', cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '700', width: '100%', marginBottom: '12px',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}
            >
              Proceed to Secure Checkout
            </button>
            <button
              onClick={() => navigate('/customer/browse')}
              style={{ background: 'transparent', color: '#001a66', border: '1px solid #001a66', padding: '14px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500', width: '100%' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
