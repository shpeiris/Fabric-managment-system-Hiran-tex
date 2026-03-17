import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import orderService from '../../../services/orderService'
import cartService from '../../../services/cartService'
import './MyOrders.css'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getAllOrders()
      // The backend returns { orders: [...] }
      setOrders(data.orders || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
      setLoading(false)
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

      for (const item of items) {
        await cartService.addToCart({
          fabric_id: item.fabric_id,
          quantity: item.quantity
        })
      }
      
      alert("Items added to cart successfully!")
      navigate('/customer/cart')
    } catch (err) {
      console.error("Reorder error:", err)
      alert("Failed to reorder items. Some items might be out of stock.")
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
      <div className="orders-filter">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
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
                <div className="order-actions">
                  <button className="btn-view" onClick={() => handleViewDetails(order.order_id)}>
                    View Details
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
            <h2>Order Details #{selectedOrder.order.order_id}</h2>
            <div className="order-info-summary">
              <p><strong>Status:</strong> {selectedOrder.order.order_status}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.order.order_date).toLocaleString()}</p>
              <p><strong>Delivery:</strong> {selectedOrder.order.delivery_type} to {selectedOrder.order.delivery_address}</p>
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