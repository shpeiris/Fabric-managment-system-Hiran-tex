import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from "../../utils/auth.js";
import SalesLogger from "../../utils/salesLogger.js";
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
    delivery_contact_number: ''
  });

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
        delivery_contact_number: ''
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
        alert('Order status updated successfully!');
        SalesLogger.orders.statusUpdate(orderId, `${newStatus}_success`);
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to update order status'}`);
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
      alert('Please enter both name and contact number');
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
          delivery_contact_number
        })
      });

      if (response.ok) {
        alert('Order marked as Delivered!');
        SalesLogger.orders.statusUpdate(orderId, 'DELIVERED_success');
        setShowDeliveryModal(false);
        fetchOrders();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to mark as Delivered'}`);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      SalesLogger.orders.statusUpdateError(orderId, err);
      alert('Failed to update order status');
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
      alert("No payment record found. Only orders with initial payment records can be confirmed.");
      return;
    }

    if (!confirm(`Confirm payment of Rs.${order.total_amount}?`)) return;

    try {
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payments/confirm`, {
        method: 'POST',
        body: JSON.stringify({ payment_id: order.payment_id, status: status })
      });

      if (response.ok) {
        alert("Payment confirmed!");
        fetchOrders();
      } else {
        alert("Failed to confirm payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming payment");
    }
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
                    {order.order_status === 'DELIVERED' && (order.delivered_by || order.delivery_contact_number) && (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                        By: {order.delivered_by || 'N/A'} {order.delivery_contact_number ? `(${order.delivery_contact_number})` : ''}
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
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeliveryModal(false)} disabled={loading}>Cancel</button>
              <button className="btn-confirm" onClick={submitDeliveredStatus} disabled={loading}>
                {loading ? 'Processing...' : 'Confirm Delivered'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
