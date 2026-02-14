import React, { useState } from 'react'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

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
        </select>
      </div>
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <button>Browse Fabrics</button>
          </div>
        ) : (
          <div className="order-cards">
            {/* Order cards will be rendered here */}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders