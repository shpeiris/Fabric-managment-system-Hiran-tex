import React from 'react'

const SalesDashboard = () => {
  return (
    <div className="sales-dashboard">
      <h1>Sales Dashboard</h1>
      <div className="sales-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <h3>Today's Sales</h3>
            <p>$--</p>
          </div>
          <div className="overview-card">
            <h3>This Month</h3>
            <p>$--</p>
          </div>
          <div className="overview-card">
            <h3>Active Orders</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>Pending Payments</h3>
            <p>$--</p>
          </div>
        </div>
      </div>
      <div className="sales-charts">
        <div className="chart-container">
          <h3>Sales Trend</h3>
          <p>Chart will be displayed here</p>
        </div>
        <div className="chart-container">
          <h3>Top Selling Fabrics</h3>
          <p>Chart will be displayed here</p>
        </div>
      </div>
      <div className="recent-orders">
        <h3>Recent Orders</h3>
        <div className="orders-preview">
          <p>No recent orders</p>
        </div>
      </div>
    </div>
  )
}

export default SalesDashboard