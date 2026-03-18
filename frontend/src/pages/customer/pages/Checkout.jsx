import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, getUser } from '../../../utils/auth.js';

const API = 'http://localhost:5000';

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');
  const user = getUser();

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || user?.tel || '',
    address: user?.address || '',
    city: '',
    postalCode: '',
    paymentMethod: 'bank-transfer',
    specialInstructions: ''
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoadingCart(true);
        const res = await apiCall(`${API}/api/cart`);
        const data = await res.json();
        if (res.ok) {
          const items = data.cart || [];
          if (items.length === 0) {
            navigate('/customer/cart');
            return;
          }
          setCartItems(items);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
        setError('Please fill in all required shipping fields.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setError('');

    const deliveryAddress = `${formData.address}, ${formData.city}${formData.postalCode ? ', ' + formData.postalCode : ''}`;

    const orderPayload = {
      items: cartItems.map(item => ({
        fabric_id: item.fabric_id,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.price_per_meter)
      })),
      delivery_address: deliveryAddress,
      delivery_type: 'STANDARD',
      payment_method: formData.paymentMethod,
      customer_name: formData.fullName,
      phone_number: formData.phone,
      special_instructions: formData.specialInstructions || null
    };

    try {
      const res = await apiCall(`${API}/api/orders`, {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data.order_id);
        setStep(3);
      } else {
        setError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  const shipping = 500;
  const total = subtotal + shipping;

  if (loadingCart) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
      <p>Loading your cart...</p>
    </div>
  );

  const [slipFile, setSlipFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadBankSlip = async () => {
    if (!slipFile) return alert("Please select a bank slip image");
    try {
      setUploadLoading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('order_id', orderSuccess);
      formDataUpload.append('slip', slipFile);

      const response = await apiCall(`${API}/api/payments/upload-slip`, {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        setUploadSuccess(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to upload slip");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading slip");
    } finally {
      setUploadLoading(false);
    }
  };

  if (step === 3 && orderSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>Order Placed Successfully!</h2>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px' }}>
          Your order <strong style={{ color: '#2563eb' }}>#{String(orderSuccess).padStart(4, '0')}</strong> has been received.
        </p>

        {formData.paymentMethod === 'bank-transfer' && !uploadSuccess ? (
          <div style={{ marginTop: '30px', padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #001a66' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#001a66', marginBottom: '10px' }}>🏦 Action Required: Upload Bank Slip</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>To process your order, please upload your payment proof below.</p>
            
            <div 
              style={{ border: '1px solid #e2e8f0', background: 'white', padding: '20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
              onClick={() => document.getElementById('checkout-slip-input').click()}
            >
              <span style={{ fontSize: '24px', display: 'block' }}>📎</span>
              <p style={{ fontSize: '14px', color: '#475569', marginTop: '8px' }}>
                {slipFile ? slipFile.name : 'Click to select bank slip image'}
              </p>
              <input 
                id="checkout-slip-input" 
                type="file" 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={(e) => setSlipFile(e.target.files[0])} 
              />
            </div>

            <button
              onClick={handleUploadBankSlip}
              disabled={uploadLoading || !slipFile}
              style={{ background: '#001a66', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: (uploadLoading || !slipFile) ? 0.6 : 1, width: '100%' }}
            >
              {uploadLoading ? 'Uploading...' : 'Submit Payment Proof'}
            </button>
          </div>
        ) : formData.paymentMethod === 'bank-transfer' && uploadSuccess ? (
          <div style={{ marginTop: '30px', padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #22c55e' }}>
            <p style={{ color: '#15803d', fontWeight: '600' }}>✅ Payment proof received!</p>
            <p style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>Our team will verify your payment and update your order shortly.</p>
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '30px' }}>We'll contact you at {formData.phone} to confirm your order.</p>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '40px' }}>
          <button
            onClick={() => navigate('/customer/orders')}
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/customer/browse')}
            style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const stepLabels = ['Shipping Info', 'Review & Pay', 'Confirmation'];

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>Complete Your Order</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Fill in your details to complete the purchase.</p>

      {/* Progress Steps */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', justifyContent: 'center', alignItems: 'center' }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= s ? '#2563eb' : '#e5e7eb', color: step >= s ? 'white' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '15px' }}>
              {step > s ? '✓' : s}
            </div>
            <span style={{ fontSize: '13px', color: step >= s ? '#2563eb' : '#9ca3af', fontWeight: step === s ? '600' : '400', display: 'none' }}>{stepLabels[s - 1]}</span>
            {s < 3 && <div style={{ width: '80px', height: '2px', background: step > s ? '#2563eb' : '#e5e7eb', transition: 'background 0.3s' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left Column */}
        <div>
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#991b1b', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '25px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Shipping Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+94 77 123 4567"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Street Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main Street"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Colombo"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Postal Code</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="00100"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Special Instructions</label>
                  <textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleChange} rows="2"
                    placeholder="Any special delivery notes..."
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '25px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Payment Method</h2>
              {[['bank-transfer', '🏦', 'Bank Transfer', 'Upload slip after order confirmation'], ['cash', '💵', 'Cash on Delivery', 'Pay when you receive']].map(([val, icon, label, desc]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', padding: '15px', border: `2px solid ${formData.paymentMethod === val ? '#2563eb' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', marginBottom: '10px', gap: '12px', background: formData.paymentMethod === val ? '#eff6ff' : 'white' }}>
                  <input type="radio" name="paymentMethod" value={val} checked={formData.paymentMethod === val} onChange={handleChange} />
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{label}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '25px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Order Review</h2>
              {cartItems.map(item => (
                <div key={item.cart_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.fabric_name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{parseFloat(item.quantity)}m × Rs. {parseFloat(item.price_per_meter).toLocaleString()}</p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Rs. {parseFloat(item.total_price).toLocaleString()}</p>
                </div>
              ))}
              <div style={{ marginTop: '16px', padding: '14px', background: '#f9fafb', borderRadius: '6px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>📍 Delivering to</p>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{formData.address}, {formData.city}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px', marginBottom: '2px' }}>💳 Payment</p>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937', textTransform: 'capitalize' }}>{formData.paymentMethod.replace('-', ' ')}</p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {step > 1 && step < 3 && (
              <button onClick={() => setStep(step - 1)}
                style={{ padding: '12px 20px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
                ← Back
              </button>
            )}
            {step === 1 && (
              <button onClick={() => { if (validateStep()) setStep(2); }}
                style={{ flex: 1, background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', fontWeight: '600' }}>
                Review Order →
              </button>
            )}
            {step === 2 && (
              <button onClick={handleSubmit} disabled={submitting}
                style={{ flex: 1, background: submitting ? '#86efac' : '#22c55e', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                {submitting ? 'Placing Order...' : '✅ Confirm & Place Order'}
              </button>
            )}
          </div>
        </div>

        {/* Right - Order Summary */}
        <div>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', position: 'sticky', top: '20px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Order Summary</h2>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
              {cartItems.map(item => (
                <div key={item.cart_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{item.fabric_name}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>{parseFloat(item.quantity)}m</p>
                  </div>
                  <p style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>Rs. {parseFloat(item.total_price).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Shipping</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>Rs. {shipping.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>Rs. {total.toLocaleString()}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>🔒 Secure checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
