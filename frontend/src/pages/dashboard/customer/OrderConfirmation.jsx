import React, { useState } from 'react';
import { apiCall } from '../../../utils/auth.js';
import { Clipboard, Printer, Mail, CreditCard, FileText, CheckCircle } from 'lucide-react';
import './OrderConfirmation.css';

const OrderConfirmation = ({ orderId, orderData, totalAmount, navigate }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [fullOrder, setFullOrder] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const handleGenerateInvoice = async () => {
    try {
      setLoadingInvoice(true);
      
      // 1. Generate/Record official invoice
      await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/invoices/generate/${orderId}`, {
         method: 'POST'
      });

      // 2. Fetch full details (items, invoice number)
      const res = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setFullOrder({ ...data.order, items: data.items });
        setShowInvoice(true);
      } else {
        alert("Could not load invoice details at this time.");
      }
    } catch (err) {
      console.error("Invoice Error:", err);
      alert("Failed to generate invoice");
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderInvoice = (order) => {
    if (!order) return null;
    const items = order.items || [];
    
    return (
      <div className="invoice-container" id="printable-invoice" style={{ padding: '40px', background: 'white', color: '#1a1a1a', fontFamily: "'Helvetica Neue', 'Helvetica', Arial, sans-serif", maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        
        {/* Header */}
        <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #001a66', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h2 style={{ color: '#001a66', margin: '0 0 5px 0', fontSize: '28px', fontWeight: '800' }}>HIRAN FABRIC TEXTILE</h2>
            <p style={{ margin: '2px 0', color: '#475569', fontSize: '13px' }}>123 Textile Road, Gampaha, Sri Lanka</p>
            <p style={{ margin: '2px 0', color: '#475569', fontSize: '13px' }}>Phone: +94 77 123 4567 | Email: support@hiranfabric.com</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: '0 0 10px 0', color: '#cbd5e1', fontSize: '36px', textTransform: 'uppercase', letterSpacing: '2px' }}>Invoice</h1>
            <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: '#0f172a', fontSize: '16px' }}>
              {order.invoice_number ? order.invoice_number.toUpperCase() : `ORDER #${order.order_id}`}
            </p>
            <p style={{ margin: '2px 0', color: '#64748b', fontSize: '13px' }}>Date: {new Date(order.order_date || new Date()).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="invoice-info" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', gap: '20px' }}>
          <div style={{ flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#001a66', textTransform: 'uppercase', fontSize: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>Billed To</h5>
            <p style={{ fontWeight: '700', margin: '0 0 5px 0', color: '#0f172a' }}>{order.customer_name || orderData?.fullName || 'Customer'}</p>
            <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>{order.phone_number || orderData?.phoneNumber || 'No phone provided'}</p>
            {order.customer_email && <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>{order.customer_email}</p>}
          </div>

          <div style={{ flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#001a66', textTransform: 'uppercase', fontSize: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>Shipped To</h5>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>
               Delivery Method: {order.delivery_type || orderData?.deliveryMethod || 'Standard'}
            </p>
            <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
              {order.delivery_address || orderData?.deliveryAddress || 'Store Pickup'}
            </p>
          </div>
        </div>

        {/* Tracking & Delivery Details */}
        {(order.tracking_id || order.delivered_by) && (
          <div style={{ marginBottom: '30px', background: '#ecfdf5', padding: '15px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
             <h5 style={{ margin: '0 0 10px 0', color: '#065f46', textTransform: 'uppercase', fontSize: '12px', borderBottom: '1px solid #a7f3d0', paddingBottom: '5px' }}>Delivery Logistics</h5>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {order.tracking_id && (
                  <div>
                    <span style={{ fontSize: '12px', color: '#047857', display: 'block' }}>Tracking / Reference ID</span>
                    <strong style={{ color: '#064e3b' }}>{order.tracking_id}</strong>
                  </div>
                )}
                {order.delivered_by && (
                  <div>
                    <span style={{ fontSize: '12px', color: '#047857', display: 'block' }}>Assigned Driver</span>
                    <strong style={{ color: '#064e3b' }}>{order.delivered_by} {order.delivery_contact_number ? `(${order.delivery_contact_number})` : ''}</strong>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* Special Instructions */}
        {(order.special_instructions || orderData?.specialInstructions) && (
          <div style={{ marginBottom: '30px', background: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fde68a' }}>
             <h5 style={{ margin: '0 0 5px 0', color: '#92400e', textTransform: 'uppercase', fontSize: '12px' }}>Customer Notes / Special Instructions</h5>
             <p style={{ margin: 0, fontSize: '13px', color: '#b45309', fontStyle: 'italic' }}>
               "{order.special_instructions || orderData?.specialInstructions}"
             </p>
          </div>
        )}

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Description</th>
              <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Qty</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Unit Price</th>
              <th style={{ padding: '12px 15px', textAlign: 'right', fontSize: '12px', color: '#475569', textTransform: 'uppercase' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '15px', fontSize: '14px', color: '#0f172a' }}>
                  <strong>{item.fabric_name}</strong>
                </td>
                <td style={{ padding: '15px', textAlign: 'center', fontSize: '14px', color: '#475569' }}>{item.quantity} m</td>
                <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', color: '#475569' }}>Rs. {Number(item.unit_price).toLocaleString()}</td>
                <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>Rs. {Number(item.total_price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: '#f8fafc', borderRadius: '8px 8px 0 0' }}>
              <span style={{ color: '#475569', fontSize: '14px' }}>Subtotal</span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>Rs. {Number(order.total_amount).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#001a66', color: 'white', borderRadius: '0 0 8px 8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Total Due</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Rs. {Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '16px' }}>Thank you for your business!</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>If you have any questions about this invoice, please contact us.</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>This is a computer-generated document. No signature is required.</p>
        </div>
      </div>
    );
  };

  const handleShareFeedback = () => {
    navigate('/customer/feedback');
  };

  const handleViewOrderHistory = () => {
    navigate('/customer/orders');
  };

  const handleContinueShopping = () => {
    navigate('/customer/browse');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-content">
        <div className="success-header">
          <div className="success-icon">
            <div className="checkmark">✓</div>
          </div>
          <h1 className="success-title">Confirmed!</h1>
          <p className="success-message">Your order has been placed successfully</p>
        </div>

        <div className="order-details-card">
          <h2>Order Details</h2>
          
          <div className="order-info-grid">
            <div className="info-item">
              <label>Order ID</label>
              <span className="order-id">#{orderId}</span>
            </div>

            <div className="info-item">
              <label>Total Amount</label>
              <span className="total-amount">Rs. {totalAmount.toFixed(2)}</span>
            </div>

            <div className="info-item">
              <label>Delivery Method</label>
              <span>{orderData.deliveryMethod === 'STORE_PICKUP' ? 'Store Pickup' : 'Home Delivery'}</span>
            </div>

            <div className="info-item">
              <label>Order Date</label>
              <span>{formatDate(new Date())}</span>
            </div>

            <div className="info-item">
              <label>Payment Method</label>
              <span>
                {orderData.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash on Delivery'}
              </span>
            </div>

            <div className="info-item">
              <label>Status</label>
              <span className="status-pending">Pending</span>
            </div>
          </div>

          <div className="delivery-details">
            <h3>Delivery Information</h3>
            <div className="delivery-info">
              <p><strong>Name:</strong> {orderData.fullName}</p>
              <p><strong>Phone:</strong> {orderData.phoneNumber}</p>
              <p><strong>Address:</strong> {orderData.deliveryAddress}</p>
              {orderData.specialInstructions && (
                <p><strong>Special Instructions:</strong> {orderData.specialInstructions}</p>
              )}
            </div>
          </div>

          {orderData.paymentMethod === 'BANK_TRANSFER' && (
            <div className="payment-notice">
              <div className="notice-content">
                <h4>Payment Verification</h4>
                <p>
                  Your payment slip has been received and is being verified. 
                  You will be notified once payment is confirmed and your order is processed.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">

          
          <div className="secondary-actions">
            <button onClick={handleViewOrderHistory} className="btn-outline">
              📋 View Order History
            </button>
            <button onClick={handleContinueShopping} className="btn-primary">
              🛒 Continue Shopping
            </button>
          </div>
        </div>

        <div className="next-steps">
          <h3>What happens next?</h3>
          <div className="steps-timeline">
            {/* Step 1: Order Placed */}
            <div className="timeline-step completed">
              <div className="step-icon">✓</div>
              <div className="step-content">
                <h4>Order Placed</h4>
                <p>Your order has been received</p>
              </div>
            </div>

            {/* Step 2: Verification */}
            <div className="timeline-step pending">
              <div className="step-icon">2</div>
              <div className="step-content">
                <h4>
                  {orderData.paymentMethod === 'BANK_TRANSFER' ? 'Payment Verification' : 'Order Verification'}
                </h4>
                <p>
                  {orderData.paymentMethod === 'BANK_TRANSFER' 
                    ? "We're verifying your payment slip" 
                    : "We're verifying your order details"
                  }
                </p>
              </div>
            </div>

            {/* Step 3: Processing */}
            <div className="timeline-step pending">
              <div className="step-icon">3</div>
              <div className="step-content">
                <h4>Processing</h4>
                <p>Your order will be prepared</p>
              </div>
            </div>

            {/* Step 4: Final Stage */}
            <div className="timeline-step pending">
              <div className="step-icon">4</div>
              <div className="step-content">
                <h4>
                  {orderData.deliveryMethod === 'STORE_PICKUP' ? 'Ready for Pickup' : 'Delivery'}
                </h4>
                <p>
                  {orderData.deliveryMethod === 'STORE_PICKUP' 
                    ? 'You can collect your order' 
                    : 'Your order will be delivered to your address'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>
      
      {/* Invoice Modal Overlay */}
      {showInvoice && fullOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }} onClick={() => setShowInvoice(false)}>
          <div style={{
            background: 'white',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '12px',
            padding: '25px'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
               <h3 style={{ margin: 0, color: '#001a66', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <CheckCircle size={22} color="#22c55e" /> Your Official Invoice
               </h3>
               <button onClick={() => setShowInvoice(false)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            {renderInvoice(fullOrder)}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
              <button 
                onClick={handlePrint}
                style={{
                  background: '#001a66',
                  color: 'white',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Printer size={18} /> Print / Save PDF
              </button>
              <button 
                onClick={() => setShowInvoice(false)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
