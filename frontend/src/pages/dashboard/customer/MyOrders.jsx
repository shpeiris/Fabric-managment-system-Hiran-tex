import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import orderService from '../../../services/orderService'
import cartService from '../../../services/cartService'
import { apiCall } from '../../../utils/auth.js'
import './MyOrders.css'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [dismissedIds, setDismissedIds] = useState([])
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
    fetchNotifications()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getMyOrders()
      setOrders(data.orders || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await apiCall('http://localhost:5000/api/customer/notifications')
      if (res.ok) {
        const data = await res.json()
        // Only show payment-related notifications (newest first, max 5)
        const paymentNotifs = (data.notifications || [])
          .filter(n => n.confirmation_type === 'payment_confirmation' || n.confirmation_type === 'payment_rejection')
          .slice(0, 5)
        setNotifications(paymentNotifs)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  const handleViewDetails = async (orderId) => {
    try {
      const data = await orderService.getOrderById(orderId)
      setSelectedOrder(data)
      setShowModal(true)
    } catch (err) {
      alert("Failed to fetch order details.")
    }
  }

  const handleReorder = async (items) => {
    try {
      if (!items || items.length === 0) {
        alert("No items to reorder.")
        return
      }

      setLoading(true)
      const reorderPromises = items.map(item => 
        cartService.addToCart({
          fabric_id: item.fabric_id,
          quantity: item.quantity
        })
      )
      
      await Promise.all(reorderPromises)
      setLoading(false)
      
      alert("Items added to cart successfully!")
      navigate('/customer/cart')
    } catch (err) {
      console.error("Reorder error:", err)
      setLoading(false)
      alert("Failed to reorder items. Some items might be out of stock.")
    }
  }

  const handleReorderFromList = async (orderId) => {
    try {
      setLoading(true)
      const data = await orderService.getOrderById(orderId)
      await handleReorder(data.items)
    } catch (err) {
      console.error("Reorder from list error:", err)
      setLoading(false)
      alert("Failed to fetch order items for reorder.")
    }
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.order_status.toLowerCase() === statusFilter.toLowerCase())

  if (loading) return <div className="loading">Loading orders...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="my-orders">
      <h1>My Orders</h1>

      {/* Payment Verification Notifications */}
      {notifications.filter(n => !dismissedIds.includes(n.confirmation_id)).map(notif => {
        const isRejected = notif.message_content?.startsWith('[REJECTED]');
        const message = notif.message_content?.replace('[REJECTED] ', '') || '';
        const isOrderConf = notif.confirmation_type === 'order_confirmation';
        
        return (
          <div key={notif.confirmation_id} style={{
            display: 'flex', alignItems: 'stretch', borderRadius: '12px', marginBottom: '16px',
            overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            border: `1px solid ${isRejected ? '#fecaca' : isOrderConf ? '#bfdbfe' : '#a7f3d0'}`
          }}>
            <div style={{
              width: '12px', flexShrink: 0,
              background: isRejected ? '#ef4444' : isOrderConf ? '#3b82f6' : '#10b981'
            }} />
            <div style={{
              flex: 1, padding: '16px 20px', background: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#111827', fontWeight: '700' }}>
                    {isRejected ? '⚠️ Action Required' : isOrderConf ? '📦 Order Verified' : '✅ Payment Confirmed'} — Order #{notif.order_id}
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>{message}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>{new Date(notif.sent_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setDismissedIds(prev => [...prev, notif.confirmation_id])}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px' }}
                >×</button>
              </div>
            </div>
          </div>
        );
      })}
      <div className="orders-filter">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found for this filter.</p>
            <button onClick={() => navigate('/customer/browse')}>Browse Fabrics</button>
          </div>
        ) : (
          <div className="order-cards">
            {filteredOrders.map(order => (
              <div key={order.order_id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">Order #{order.order_id}</span>
                    <div className="order-date">{new Date(order.order_date).toLocaleDateString()}</div>
                  </div>
                  <span className={`order-status status-${order.order_status.toLowerCase()}`}>
                    {order.order_status}
                  </span>
                </div>
                <div className="order-body">
                  <span className="item-count">{order.item_count} items</span>
                  <span className="order-total">Rs. {parseFloat(order.total_amount).toFixed(2)}</span>
                </div>

                {/* Payment / Slip Status row */}
                {order.latest_payment_status && (
                  <div style={{ padding: '8px 0', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    {order.bank_slip_url ? (
                      <span style={{ fontSize: '12px', background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                        ✅ Slip Uploaded — Awaiting Verification
                      </span>
                    ) : order.latest_payment_status === 'PENDING' ? (
                      <span style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                        ⚠️ Bank Slip Required
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', background: '#ede9fe', color: '#5b21b6', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                        💳 {order.latest_payment_status}
                      </span>
                    )}
                    {!order.bank_slip_url && order.latest_payment_status === 'PENDING' && (
                      <button
                        onClick={() => navigate(`/customer/order-details/${order.order_id}`)}
                        style={{ fontSize: '12px', background: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Upload Slip →
                      </button>
                    )}
                  </div>
                )}

                <div className="order-actions">
                  <button className="btn-view" onClick={() => handleViewDetails(order.order_id)}>
                    View Details
                  </button>
                  {order.order_status === 'DELIVERED' && (
                    <button 
                      className="btn-rate" 
                      style={{ 
                        background: '#fbbf24', 
                        color: '#92400e', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        cursor: 'pointer' 
                      }}
                      onClick={() => navigate(`/customer/order-details/${order.order_id}`)}
                    >
                      Rate Order
                    </button>
                  )}
                  <button 
                    className="btn-reorder-small" 
                    onClick={() => handleReorderFromList(order.order_id)}
                  >
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <div className="modal-header">
              <h2>Order Details #{selectedOrder.order.order_id}</h2>
              <span className={`order-status status-${selectedOrder.order.order_status.toLowerCase()}`}>
                {selectedOrder.order.order_status}
              </span>
            </div>
            
            <div className="order-info-summary">
              <div className="order-info-grid">
                <div className="order-info-item">
                  <span className="info-label">📅 Date Placed</span>
                  <span className="info-value">{new Date(selectedOrder.order.order_date).toLocaleString()}</span>
                </div>
                <div className="order-info-item">
                  <span className="info-label">🚚 Delivery Method</span>
                  <span className="info-value">{selectedOrder.order.delivery_type?.replace('_', ' ')}</span>
                </div>
                <div className="order-info-item" style={{gridColumn: '1 / -1'}}>
                  <span className="info-label">📍 Delivery Address</span>
                  <span className="info-value">{selectedOrder.order.delivery_address || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="order-details-list">
              {selectedOrder.items.map(item => (
                <div key={item.order_item_id} className="detail-item">
                  <div className="detail-item-info">
                    <h4>{item.fabric_name}</h4>
                    <p>{item.quantity}m x Rs. {parseFloat(item.unit_price).toFixed(2)}</p>
                  </div>
                  <div className="detail-item-price">
                    Rs. {parseFloat(item.total_price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-summary-total">
              <span>Total Amount</span>
              <span>Rs. {parseFloat(selectedOrder.order.total_amount).toFixed(2)}</span>
            </div>
            
            <div className="modal-actions" style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
              <button 
                className="btn-reorder" 
                style={{width: '100%'}}
                onClick={() => handleReorder(selectedOrder.items)}
              >
                Reorder All Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders