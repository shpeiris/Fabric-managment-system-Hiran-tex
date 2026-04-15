import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, getUser } from '../../../utils/auth.js';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');
  const [slipFile, setSlipFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const user = getUser();
  
  const bankDetails = {
    bankName: "People's Bank",
    accountName: "Hiran Fabric Textile",
    accountNumber: "2022154879536",
    branch: "Nittambuwa"
  };

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || user?.tel || '',
    address: user?.address || '',
    city: '',
    postalCode: '',
    paymentMethod: 'BANK_TRANSFER',
    specialInstructions: '',
    deliveryType: 'STORE_PICKUP' // Default to Store Pickup (Only option)
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
            // Hardcoded sample data for testing purposes if cart is empty
            const sampleItems = [
              {
                cart_id: 'test-1',
                fabric_id: 1,
                fabric_name: "Premium Silk Satin",
                color: "Midnight Blue",
                price_per_meter: 1500,
                quantity: 2,
                total_price: 3000
              },
              {
                cart_id: 'test-2',
                fabric_id: 2,
                fabric_name: "Soft Cotton Voile",
                color: "Cloud White",
                price_per_meter: 850,
                quantity: 5,
                total_price: 4250
              }
            ];
            setCartItems(sampleItems);
            
            // Also fill some sample form data
            setFormData(prev => ({
              ...prev,
              city: 'Colombo',
              postalCode: '00100',
              address: '456 Sample Lane'
            }));
            
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

  // Reset payment method if it becomes invalid for the selected delivery type
  useEffect(() => {
    if (formData.deliveryType === 'HOME_DELIVERY' && formData.paymentMethod === 'CASH_AT_CASHIER') {
      setFormData(prev => ({ ...prev, paymentMethod: 'BANK_TRANSFER' }));
    }
  }, [formData.deliveryType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateStep = () => {
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError('Please fill in Name, Email and Phone Number.');
        return false;
      }
      if (formData.deliveryType !== 'STORE_PICKUP' && (!formData.address || !formData.city)) {
        setError('Please fill in Address and City for Delivery.');
        return false;
      }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep()) return;
    
    // Validate slip for bank transfer
    if (formData.paymentMethod === 'BANK_TRANSFER' && !slipFile) {
      setError('Please upload your bank deposit slip to place this order.');
      // Scroll to error or help user find it
      return;
    }

    setSubmitting(true);
    setError('');

    const deliveryAddress = formData.deliveryType === 'STORE_PICKUP' 
      ? 'Store Pickup (Hiran Fabric Textile, Nittambuwa)' 
      : `${formData.address}${formData.city ? ', ' + formData.city : ''}${formData.postalCode ? ', ' + formData.postalCode : ''}`;

    const orderPayload = {
      items: cartItems.map(item => ({
        fabric_id: item.fabric_id,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.price_per_meter)
      })),
      delivery_address: deliveryAddress,
      delivery_type: formData.deliveryType,
      payment_method: formData.paymentMethod,
      customer_name: formData.fullName,
      phone_number: formData.phone,
      special_instructions: formData.specialInstructions || null
    };

    try {
      console.log('Placing order with payload:', orderPayload);
      
      // 1. Create Order
      const res = await apiCall(`${API}/api/orders`, {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      const orderId = data.order_id;
      console.log('Order created successfully:', orderId);
      setOrderSuccess(orderId);

      // 2. Handle Slip Upload if needed
      if (formData.paymentMethod === 'BANK_TRANSFER' && slipFile) {
        try {
          const formDataUpload = new FormData();
          formDataUpload.append('order_id', orderId);
          formDataUpload.append('slip', slipFile);

          console.log('Uploading bank slip for order:', orderId);
          const uploadRes = await apiCall(`${API}/api/payments/upload-slip`, {
            method: 'POST',
            body: formDataUpload
          });

          if (!uploadRes.ok) {
            const uploadError = await uploadRes.json().catch(() => ({ error: 'Upload failed' }));
            console.warn('Slip upload failed but order was placed:', uploadError);
            setUploadSuccess(false);
          } else {
            console.log('Slip uploaded successfully');
            setUploadSuccess(true);
          }
        } catch (uploadErr) {
          console.error('Non-blocking error during slip upload:', uploadErr);
          setUploadSuccess(false);
        }
      }

      // 3. Complete Checkout (State transition to Success screen)
      setStep(3);
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Could not connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryUpload = async () => {
    if (!slipFile) {
      setError('Please select a file first.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('order_id', orderSuccess);
      formDataUpload.append('slip', slipFile);

      const uploadRes = await apiCall(`${API}/api/payments/upload-slip`, {
        method: 'POST',
        body: formDataUpload
      });

      if (!uploadRes.ok) {
        const uploadError = await uploadRes.json();
        throw new Error(uploadError.error || 'Failed to upload bank slip.');
      }

      setUploadSuccess(true);
      // Optional: Add an activity log or notification here if requested
    } catch (err) {
      setError(err.message || 'Failed to upload bank slip. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const handlePrint = () => {
    window.print();
  };

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
  
  const getShippingFee = () => {
    switch (formData.deliveryType) {
      case 'GAMPAHA': return 500;
      case 'OUT_OF_GAMPAHA': return 750;
      default: return 0;
    }
  };

  const shipping = getShippingFee();
  const total = subtotal + shipping;

  if (loadingCart) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
      <p>Loading your cart...</p>
    </div>
  );

  if (step === 3 && orderSuccess) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '15px' }}>✅</div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Order Placed Successfully!</h2>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Thank you for your purchase. Your order number is <strong style={{ color: '#001a66' }}>#{String(orderSuccess).padStart(4, '0')}</strong>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          {/* Order Details Summary */}
          <div className="order-summary-card" style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📦 Items Ordered
            </h3>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '15px', marginBottom: '15px' }}>
              {cartItems.map(item => (
                <div key={item.cart_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563' }}>{item.fabric_name} (x{parseFloat(item.quantity)}m)</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Rs. {parseFloat(item.total_price).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontSize: '14px', color: '#111827' }}>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {formData.deliveryType === 'STORE_PICKUP' ? 'Collection' : `Delivery (${formData.deliveryType === 'GAMPAHA' ? 'Gampaha' : 'Out of Gampaha'})`}
              </span>
              <span style={{ fontSize: '14px', color: shipping === 0 ? '#166534' : '#111827', fontWeight: shipping === 0 ? '700' : '500' }}>
                {shipping === 0 ? 'FREE' : `Rs. ${shipping.toLocaleString()}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '2px solid #f3f4f6' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Total Amount</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#001a66' }}>Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '15px' }}>📍 {formData.deliveryType === 'STORE_PICKUP' ? 'Pickup Location' : 'Delivery Details'}</h3>
              
              <div style={{ marginBottom: '15px', borderBottom: '1px solid #f3f4f6', paddingBottom: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#6b7280' }}>Delivery:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{formData.deliveryType === 'STORE_PICKUP' ? '🏪 Store Pickup' : '🏠 Home Delivery'}</span>
                  
                  <span style={{ color: '#6b7280' }}>Payment:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>
                    {formData.paymentMethod === 'BANK_TRANSFER' ? '🏦 Bank Transfer' : '💵 Cash at Cashier'}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '4px', fontWeight: '600' }}>{formData.fullName}</p>
              {formData.deliveryType === 'STORE_PICKUP' ? (
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  Hiran Fabric Textile Store<br />
                  Nittambuwa
                </p>
              ) : (
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  {formData.address}, {formData.city}<br />
                  {formData.postalCode}
                </p>
              )}
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '10px' }}>📞 {formData.phone}</p>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '15px' }}>💳 Payment Status</h3>
              <p style={{ fontSize: '14px', color: '#4b5563', fontWeight: '600', textTransform: 'capitalize', marginBottom: '15px' }}>
                {formData.paymentMethod.replace(/_/g, ' ').toLowerCase()}
              </p>
              
              {formData.paymentMethod === 'BANK_TRANSFER' && (
                <div>
                  {uploadSuccess ? (
                    <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '13px' }}>
                      <span style={{ fontWeight: '700' }}>✅ Proof Uploaded</span><br />
                      Our sales team is currently verifying your payment.
                    </div>
                  ) : (
                    <div style={{ padding: '12px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', color: '#9a3412', fontSize: '13px' }}>
                      <span style={{ fontWeight: '700' }}>⚠️ Slip Missing or Failed</span><br />
                      Please upload your bank slip so the salesperson can confirm your order.
                      
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <input 
                          type="file" 
                          onChange={(e) => setSlipFile(e.target.files[0])} 
                          accept="image/*,.pdf"
                          style={{ fontSize: '11px', width: '130px' }}
                        />
                        <button 
                          onClick={handleRetryUpload}
                          disabled={submitting}
                          style={{ background: '#f97316', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {submitting ? '...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.paymentMethod === 'CASH_AT_CASHIER' && (
                <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e40af', fontSize: '13px' }}>
                  <span style={{ fontWeight: '700' }}>💵 Pay at Store</span><br />
                  Please present your Order ID to the cashier at the time of collection.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
          <button
            onClick={() => navigate('/customer/orders')}
            style={{ padding: '12px 30px', background: '#001a66', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            📦 Track My Order
          </button>
          <button
            onClick={handlePrint}
            style={{ padding: '12px 30px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🖨️ Print Receipt
          </button>
          <button
            onClick={() => navigate('/customer/browse')}
            style={{ padding: '12px 30px', background: 'white', color: '#001a66', border: '2px solid #001a66', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
          >
            Continue Shopping
          </button>
        </div>

        {/* Next Steps Section */}
        <div className="no-print" style={{ background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔭 What happens next?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#001a66', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px 0' }}>Order Processing</p>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                  {formData.paymentMethod === 'BANK_TRANSFER' 
                    ? 'Our sales team will verify your bank slip. Once confirmed, your order status will update to "Processing".'
                    : 'Your order has been recorded. Our team will prepare your items for pickup.'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#001a66', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px 0' }}>Notifications</p>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                  You will receive updates on your dashboard. You can track all your orders in the "My Orders" section.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#001a66', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px 0' }}>
                  {formData.deliveryType === 'STORE_PICKUP' ? 'Collection' : 'Delivery'}
                </p>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                  {formData.deliveryType === 'STORE_PICKUP'
                    ? 'Visit our Nittambuwa store. Bring your Order ID for a faster checkout process.'
                    : 'Your fabrics will be packed and delivered to your address within 3-5 business days.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
            @media print {
              .no-print { display: none !important; }
              body { 
                background: white !important; 
                padding: 0 !important;
                margin: 0 !important;
                -webkit-print-color-adjust: exact;
              }
              div { border: none !important; box-shadow: none !important; }
              strong { color: #001a66 !important; }
              h2, h3 { color: #111827 !important; margin-top: 0 !important; }
              .print-container { width: 100% !important; max-width: 100% !important; padding: 20px !important; }
              .order-summary-card { border: 1px solid #eee !important; page-break-inside: avoid; }
            }
          `}
        </style>
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
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Delivery & Collection</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                {/* Store Pickup */}
                <label style={{ display: 'flex', alignItems: 'center', padding: '15px', border: `2px solid ${formData.deliveryType === 'STORE_PICKUP' ? '#2563eb' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', gap: '15px', background: formData.deliveryType === 'STORE_PICKUP' ? '#eff6ff' : 'white' }}>
                  <input type="radio" name="deliveryType" value="STORE_PICKUP" checked={formData.deliveryType === 'STORE_PICKUP'} onChange={handleChange} />
                  <span style={{ fontSize: '24px' }}>🏪</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Store Pickup (Nittambuwa)</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Collect from our store (Free)</p>
                  </div>
                </label>

                {/* Gampaha */}
                <label style={{ display: 'flex', alignItems: 'center', padding: '15px', border: `2px solid ${formData.deliveryType === 'GAMPAHA' ? '#2563eb' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', gap: '15px', background: formData.deliveryType === 'GAMPAHA' ? '#eff6ff' : 'white' }}>
                  <input type="radio" name="deliveryType" value="GAMPAHA" checked={formData.deliveryType === 'GAMPAHA'} onChange={handleChange} />
                  <span style={{ fontSize: '24px' }}>🚚</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Gampaha</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>Delivered within 2-5 business days</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}><strong>Rs 500.00</strong></p>
                  </div>
                </label>

                {/* Out of Gampaha */}
                <label style={{ display: 'flex', alignItems: 'center', padding: '15px', border: `2px solid ${formData.deliveryType === 'OUT_OF_GAMPAHA' ? '#2563eb' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', gap: '15px', background: formData.deliveryType === 'OUT_OF_GAMPAHA' ? '#eff6ff' : 'white' }}>
                  <input type="radio" name="deliveryType" value="OUT_OF_GAMPAHA" checked={formData.deliveryType === 'OUT_OF_GAMPAHA'} onChange={handleChange} />
                  <span style={{ fontSize: '24px' }}>🚛</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Out of Gampaha</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0' }}>Delivered within 2-7 business days</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}><strong>Rs 750.00</strong></p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '25px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Contact Details</h2>
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
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+94 77 112 4088"
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                
                {formData.deliveryType !== 'STORE_PICKUP' && (
                  <>
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
                  </>
                )}
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Special Instructions</label>
                  <textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleChange} rows="2"
                    placeholder="Any special notes or requirements..."
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '25px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Payment Method</h2>
              {[
                ['BANK_TRANSFER', '🏦', 'Bank Transfer & Slip Upload', 'Upload your bank deposit slip for verification'],
                ['CASH_AT_CASHIER', '💵', 'Cash at Store / Cashier', 'Pay directly at our outlet before collecting items']
              ].map(([val, icon, label, desc]) => {
                // Determine if this payment method should be disabled based on delivery type
                const isDisabled = val === 'CASH_AT_CASHIER' && formData.deliveryType !== 'STORE_PICKUP';
                const reason = isDisabled ? 'Only available for Store Pickup' : '';
                
                return (
                  <label 
                    key={val} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '15px', 
                      border: `2px solid ${formData.paymentMethod === val ? '#2563eb' : '#e5e7eb'}`, 
                      borderRadius: '8px', 
                      cursor: isDisabled ? 'not-allowed' : 'pointer', 
                      marginBottom: '10px', 
                      gap: '12px', 
                      background: formData.paymentMethod === val ? '#eff6ff' : (isDisabled ? '#f9fafb' : 'white'),
                      opacity: isDisabled ? 0.6 : 1
                    }}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={val} 
                      checked={formData.paymentMethod === val} 
                      onChange={handleChange} 
                      disabled={isDisabled}
                    />
                    <span style={{ fontSize: '20px' }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{label}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        {isDisabled ? reason : desc}
                      </p>
                    </div>
                  </label>
                );
              })}
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
              
              <div style={{ marginTop: '16px', padding: '14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Method:</span>
                  <span style={{ fontWeight: '700', color: '#111827' }}>
                    {formData.deliveryType === 'STORE_PICKUP' ? '🏪 Store Pickup (Free)' : 
                     formData.deliveryType === 'GAMPAHA' ? '🚚 Gampaha (Rs. 500)' : '🚛 Out of Gampaha (Rs. 750)'}
                  </span>

                  <span style={{ color: '#6b7280' }}>{formData.deliveryType === 'STORE_PICKUP' ? 'Pickup at:' : 'Deliver to:'}</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>
                    {formData.deliveryType === 'STORE_PICKUP' ? 'Hiran Fabric Textile, Nittambuwa' : `${formData.address}, ${formData.city}`}
                  </span>

                  <span style={{ color: '#6b7280' }}>Contact Name:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{formData.fullName}</span>

                  <span style={{ color: '#6b7280' }}>Phone:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{formData.phone}</span>
                  
                  <span style={{ color: '#6b7280' }}>Payment Mode:</span>
                  <span style={{ fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                    {formData.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash at Store'}
                  </span>
                </div>
              </div>

              {formData.paymentMethod === 'BANK_TRANSFER' && (
                <div style={{ marginTop: '25px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#001a66', margin: 0 }}>Amount to Transfer:</h3>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>Rs. {total.toLocaleString()}</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🏦 Bank Account Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                      <div>
                        <p style={{ color: '#94a3b8', margin: '0 0 2px 0', fontSize: '12px' }}>Bank Name</p>
                        <p style={{ color: '#1e293b', fontWeight: '600', margin: 0 }}>{bankDetails.bankName}</p>
                      </div>
                      <div>
                        <p style={{ color: '#94a3b8', margin: '0 0 2px 0', fontSize: '12px' }}>Branch</p>
                        <p style={{ color: '#1e293b', fontWeight: '600', margin: 0 }}>{bankDetails.branch}</p>
                      </div>
                      <div>
                        <p style={{ color: '#94a3b8', margin: '0 0 2px 0', fontSize: '12px' }}>Account Name</p>
                        <p style={{ color: '#1e293b', fontWeight: '600', margin: 0 }}>{bankDetails.accountName}</p>
                      </div>
                      <div>
                        <p style={{ color: '#94a3b8', margin: '0 0 2px 0', fontSize: '12px' }}>Account Number</p>
                        <p style={{ color: '#1e293b', fontWeight: '700', margin: 0, letterSpacing: '0.5px', color: '#001a66' }}>{bankDetails.accountNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '10px', fontWeight: '600' }}>Upload Payment Slip *</label>
                  {slipFile ? (
                    <div style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', background: '#f0f9ff', textAlign: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSlipFile(null); }}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                      >
                        ×
                      </button>
                      <div style={{ fontSize: '32px', marginBottom: '10px', color: '#9ca3af' }}>📄</div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#001a66', marginBottom: '4px' }}>{slipFile.name}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '15px' }}>({(slipFile.size / 1024).toFixed(1)} KB)</p>
                      
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSubmit(e); }}
                        disabled={submitting}
                        style={{ 
                          width: '100%',
                          background: submitting ? '#86efac' : '#22c55e', 
                          color: 'white', 
                          border: 'none', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          fontSize: '14px', 
                          cursor: submitting ? 'not-allowed' : 'pointer', 
                          fontWeight: '700',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {submitting ? 'Placing Order...' : '🚀 Final Step: Confirm & Place Order'}
                      </button>
                    </div>
                  ) : (
                    <label 
                      htmlFor="slip-file-input"
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                      style={{ 
                        display: 'block',
                        border: '2px dashed #e5e7eb', 
                        borderRadius: '12px', 
                        padding: '40px 20px', 
                        textAlign: 'center',
                        background: '#f9fafb',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div style={{ fontSize: '40px', marginBottom: '16px' }}>📑</div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                        Click to upload payment slip
                      </p>
                      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '280px', margin: '0 auto' }}>
                        Please upload a clear photo or PDF of your deposit slip for verification.
                      </p>
                      <div style={{ marginTop: '16px', display: 'inline-block', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                        Select File
                      </div>
                    </label>
                  )}
                  <input 
                    id="slip-file-input"
                    ref={fileInputRef}
                    type="file" 
                    style={{ display: 'none' }} 
                    accept="image/*,.pdf" 
                    onChange={(e) => setSlipFile(e.target.files[0])} 
                  />
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {step > 1 && step < 3 && (
              <button type="button" onClick={() => setStep(step - 1)}
                style={{ padding: '12px 20px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
                ← Back
              </button>
            )}
            {step === 1 && (
              <button type="button" onClick={() => { if (validateStep()) setStep(2); }}
                style={{ flex: 1, background: '#001a66', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                CONTINUE TO PAYMENT
              </button>
            )}
            {step === 2 && formData.paymentMethod !== 'BANK_TRANSFER' && (
              <button type="button" 
                onClick={(e) => { e.stopPropagation(); handleSubmit(e); }} 
                disabled={submitting}
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
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  {formData.deliveryType === 'STORE_PICKUP' ? 'Collection' : 'Delivery'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: shipping === 0 ? '#16a34a' : '#1f2937' }}>
                  {shipping === 0 ? 'FREE' : `Rs. ${shipping.toLocaleString()}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Payment</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>
                  {formData.paymentMethod === 'BANK_TRANSFER' ? 'Bank' : 'Cash'}
                </span>
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
