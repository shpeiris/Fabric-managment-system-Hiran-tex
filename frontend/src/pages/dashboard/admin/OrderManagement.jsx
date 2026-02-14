import React, { useState } from 'react'

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')

  return (
    <div className="order-management">
      <h1>Order Management</h1>
      <div className="order-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" placeholder="From Date" />
        <input type="date" placeholder="To Date" />
      </div>
      <div className="order-list">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="6">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderManagement