import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';
import { apiCall } from "../../utils/auth.js";
import SalesLogger from "../../utils/salesLogger.js";
import { Clipboard, Printer, Mail, CreditCard, Search, FileText } from 'lucide-react';
import "./Orders.css";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  
  // Delivery Modal State
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    orderId: null,
    delivered_by: '',
    delivery_contact_number: '',
    tracking_id: ''
  });
  
  // Invoice State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [fetchingInvoice, setFetchingInvoice] = useState(false);

  useEffect(() => {
    SalesLogger.orders.pageLoad({ timestamp: new Date().toISOString() });
    fetchOrders();
  }, []);

  useEffect(() => {
    if (filterStatus) {
      SalesLogger.orders.filterChange(filterStatus);
      fetchOrders();
    }
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? `?status=${filterStatus}` : '';
      SalesLogger.orders.ordersFetch({ filter: filterStatus || 'all' });
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/orders${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
        SalesLogger.orders.ordersFetch(data.orders?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      SalesLogger.orders.ordersFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === 'DELIVERED') {
      setDeliveryData({
        orderId: orderId,
        delivered_by: '',
        delivery_contact_number: '',
        tracking_id: ''
      });
      setShowDeliveryModal(true);
      return;
    }

    setLoading(true);
    try {
      SalesLogger.orders.statusUpdate(orderId, newStatus);
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Order status updated successfully!');
        SalesLogger.orders.statusUpdate(orderId, `${newStatus}_success`);
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Failed to update order status'}`);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      SalesLogger.orders.statusUpdateError(orderId, err);
      alert('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const submitDeliveredStatus = async () => {
    const { orderId, delivered_by, delivery_contact_number } = deliveryData;
    
    if (!delivered_by || !delivery_contact_number) {
      toast.warning('Please enter both name and contact number');
      return;
    }

    try {
      setLoading(true);
      SalesLogger.orders.statusUpdate(orderId, 'DELIVERED');
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: 'DELIVERED',
          delivered_by,
          delivery_contact_number,
          tracking_id
        })
      });

      if (response.ok) {
        toast.success('Order marked as Delivered!');
        SalesLogger.orders.statusUpdate(orderId, 'DELIVERED_success');
        setShowDeliveryModal(false);
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error || 'Failed to mark as Delivered'}`);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      SalesLogger.orders.statusUpdateError(orderId, err);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (order, status) => {
    if (!order.payment_id) {
      // If no payment record exists (e.g. old order), create one? 
      // Or maybe the order was created without payment method.
      // For this flow, let's assume payment record exists or we might need to handle "Cash" manual entry.
      // But typically we created payment record on order creation if method selected.
      // If not, we might need an endpoint to "Create & Confirm Payment".
      // Let's assume for CASH we might just need to confirm.

      // If order has no payment_id, we can't use /api/payments/confirm.
      // We might need to ask user to "Adding Cash Payment" -> then confirm.
      toast.error("No payment record found. Only orders with initial payment records can be confirmed.");
      return;
    }

    if (!confirm(`Confirm payment of Rs.${order.total_amount}?`)) return;

    try {
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payments/confirm`, {
        method: 'POST',
        body: JSON.stringify({ payment_id: order.payment_id, status: status })
      });

      if (response.ok) {
        toast.success("Payment confirmed!");
        fetchOrders();
      } else {
        toast.error("Failed to confirm payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error confirming payment");
    }
  };

  const handleViewInvoice = async (orderId) => {
    try {
      setFetchingInvoice(true);
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        // Since API returns {order, items}, we merge them to match Dashboard's expected format
        const fullOrder = { ...data.order, items: data.items };
        setSelectedOrderForInvoice(fullOrder);
        setShowInvoiceModal(true);
      } else {
        toast.error("Failed to fetch order details for invoice");
      }
    } catch (err) {
      console.error("Error fetching invoice details:", err);
      toast.error("Error loading invoice");
    } finally {
      setFetchingInvoice(false);
    }
  };

  const handlePrintInvoice = async (orderId) => {
    try {
      // 1. Generate/Record the invoice in the official DB table
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/invoices/generate/${orderId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // 2. Refresh local details to get the invoice_number
        const detailResponse = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/${orderId}`);
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          setSelectedOrderForInvoice({ ...detailData.order, items: detailData.items });
        }
        
        // 3. Trigger print
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        // Fallback to basic print
        window.print();
      }
    } catch (error) {
      console.error("Error during invoice generation:", error);
      window.print();
    }
  };

  const renderInvoice = (order) => {
    if (!order) return null;
    const items = order.items || [];
    
    const getDeliveryFee = (type) => {
      if (type === 'GAMPAHA') return 500;
      if (type === 'OUT_OF_GAMPAHA') return 750;
      if (type === 'STORE_PICKUP') return 0;
      return 500;
    };

    const deliveryFee = getDeliveryFee(order.delivery_type);
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    
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
            <p style={{ fontWeight: '700', margin: '0 0 5px 0', color: '#0f172a' }}>{order.customer_name || 'Walk-in Customer'}</p>
            <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>{order.phone_number || 'No phone provided'}</p>
            {order.customer_email && <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>{order.customer_email}</p>}
          </div>

          <div style={{ flex: 1, background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#001a66', textTransform: 'uppercase', fontSize: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>Shipped To</h5>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>
               Delivery Method: {order.delivery_type || 'Standard'}
            </p>
            <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
              {order.delivery_address || 'Store Pickup'}
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
        {order.special_instructions && (
          <div style={{ marginBottom: '30px', background: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fde68a' }}>
             <h5 style={{ margin: '0 0 5px 0', color: '#92400e', textTransform: 'uppercase', fontSize: '12px' }}>Customer Notes / Special Instructions</h5>
             <p style={{ margin: 0, fontSize: '13px', color: '#b45309', fontStyle: 'italic' }}>
               "{order.special_instructions}"
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
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#475569', fontSize: '14px' }}>Subtotal</span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: '#f8fafc', borderRadius: '0 0 0 0' }}>
              <span style={{ color: '#475569', fontSize: '14px' }}>Delivery Fee</span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>Rs. {deliveryFee.toLocaleString()}</span>
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

  return (
    <div className="orders-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Order Management ({orders.length})</h1>
        <button className="btn-add" onClick={() => navigate('/sales/new-order')} style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          + New Order
        </button>
      </div>
      <p className="subtitle">Track and manage customer orders and payments</p>

      {/* Filter */}
      <div className="filter-bar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Delivery</th>
              <th>Feedback</th>
              <th>Official Invoice</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id}>
                <td>#{order.order_id}</td>
                <td>{order.customer_name}</td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>Rs. {Number(order.total_amount).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${order.order_status.toLowerCase()}`}>
                    {order.order_status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                    <span style={{ fontWeight: '600' }}>{order.payment_method || 'Unspecified'}</span>
                    <span style={{
                      color: order.payment_status === 'COMPLETED' ? 'green' : (order.payment_status === 'FAILED' ? 'red' : 'orange')
                    }}>
                      {order.payment_status || 'No Record'}
                    </span>
                    {order.payment_method === 'BANK_TRANSFER' && order.bank_slip_url && (
                      <a href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${order.bank_slip_url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>View Slip</a>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>{order.delivery_type || 'Standard'}</span>
                    {order.order_status === 'DELIVERED' && (order.delivered_by || order.delivery_contact_number || order.tracking_id) && (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                        By: {order.delivered_by || 'N/A'} {order.delivery_contact_number ? `(${order.delivery_contact_number})` : ''}
                        {order.tracking_id && <div style={{ color: '#001a66', marginTop: '2px' }}>Track ID: {order.tracking_id}</div>}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  {order.feedback_rating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold' }}>
                        {'★'.repeat(order.feedback_rating)}{'☆'.repeat(5 - order.feedback_rating)}
                      </span>
                      {order.feedback_comments && (
                        <span style={{ fontSize: '11px', color: '#6b7280', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.feedback_comments}>
                          "{order.feedback_comments}"
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>No feedback</span>
                  )}
                </td>
                <td>
                  <button 
                    className="btn-view-invoice"
                    onClick={() => handleViewInvoice(order.order_id)}
                    style={{ 
                      background: 'white', 
                      color: '#001a66', 
                      border: '1px solid #001a66',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    disabled={fetchingInvoice}
                  >
                    <FileText size={14} /> 
                    {order.invoice_id ? `inv ${order.invoice_id.toString().padStart(4, '0')}`.toUpperCase() : 'View Invoice'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <select
                      value={order.order_status}
                      onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                      className="status-select"
                      style={{ width: '100px' }}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>

                    {/* Payment Actions */}
                    {order.payment_status === 'PENDING' && (
                      <button
                        onClick={() => confirmPayment(order, 'COMPLETED')}
                        title="Verify & Confirm Order"
                        style={{ 
                          background: '#1e40af', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>Verify & Confirm</span>
                        <span>✓</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delivery Details</h2>
            <div className="form-group">
              <label>Delivered Person Name</label>
              <input 
                type="text" 
                value={deliveryData.delivered_by}
                onChange={(e) => setDeliveryData({...deliveryData, delivered_by: e.target.value})}
                placeholder="Enter name"
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input 
                type="text" 
                value={deliveryData.delivery_contact_number}
                onChange={(e) => setDeliveryData({...deliveryData, delivery_contact_number: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>Tracking ID / Reference</label>
              <input 
                type="text" 
                value={deliveryData.tracking_id}
                onChange={(e) => setDeliveryData({...deliveryData, tracking_id: e.target.value})}
                placeholder="Enter tracking ID"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeliveryModal(false)} disabled={loading}>Cancel</button>
              <button className="btn-confirm" onClick={submitDeliveredStatus} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm Delivered'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrderForInvoice && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <Clipboard size={20} color="#001a66" />
              <h3>Official Invoice Preview</h3>
              <button className="close-btn" onClick={() => setShowInvoiceModal(false)}>×</button>
            </div>
            <div className="modal-content">
              {renderInvoice(selectedOrderForInvoice)}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                <button 
                  className="btn print-btn" 
                  onClick={() => handlePrintInvoice(selectedOrderForInvoice.order_id)}
                  style={{ 
                    background: '#001a66', 
                    color: 'white', 
                    padding: '10px 25px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  <Printer size={18} /> Print / Download PDF
                </button>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  style={{ 
                    background: '#f1f5f9', 
                    color: '#475569', 
                    padding: '10px 25px', 
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
        </div>
      )}
    </div>
  );
}
