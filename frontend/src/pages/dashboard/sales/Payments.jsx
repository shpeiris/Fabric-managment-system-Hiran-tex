import React, { useState } from 'react'

const SalesPayments = () => {
  const [payments, setPayments] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('all')

  return (
    <div className="sales-payments">
      <h1>Payment Management</h1>
      <div className="payment-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <h3>Today's Payments</h3>
            <p>$--</p>
          </div>
          <div className="overview-card">
            <h3>This Month</h3>
            <p>$--</p>
          </div>
          <div className="overview-card">
            <h3>Pending Payments</h3>
            <p>$--</p>
          </div>
          <div className="overview-card">
            <h3>Failed Payments</h3>
            <p>--</p>
          </div>
        </div>
      </div>
      <div className="payment-controls">
        <select 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="all">All Methods</option>
          <option value="credit-card">Credit Card</option>
          <option value="bank-transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="check">Check</option>
        </select>
        <input type="date" placeholder="From Date" />
        <input type="date" placeholder="To Date" />
        <input type="text" placeholder="Search payments..." />
        <button>Export</button>
      </div>
      <div className="payments-list">
        <table>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan="8">No payments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalesPayments