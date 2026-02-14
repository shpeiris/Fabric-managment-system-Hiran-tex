import React from 'react'

const CustomerDashboard = () => {
  return (
    <div className="customer-dashboard">
      <h1>Welcome Back!</h1>
      <div className="dashboard-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Active Orders</h3>
            <p>--</p>
          </div>
          <div className="summary-card">
            <h3>Total Orders</h3>
            <p>--</p>
          </div>
          <div className="summary-card">
            <h3>Wishlist Items</h3>
            <p>--</p>
          </div>
          <div className="summary-card">
            <h3>Cart Items</h3>
            <p>--</p>
          </div>
        </div>
      </div>
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <p>No recent activity</p>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard