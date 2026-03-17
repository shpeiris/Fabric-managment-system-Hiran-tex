import React, { useState } from 'react'

const SalesOrders = () => {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <div className="sales-orders">
      <h1>Sales Orders</h1>
      <div className="orders-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <h3>Total Orders</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>Pending Orders</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>Processing</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>Completed Today</h3>
            <p>--</p>
          </div>
        </div>
      </div>
      <div className="order-controls">
        <button>Create Order</button>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" placeholder="From Date" />
        <input type="date" placeholder="To Date" />
        <input type="text" placeholder="Search orders..." />
      </div>
      <div className="orders-list">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="7">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalesOrders