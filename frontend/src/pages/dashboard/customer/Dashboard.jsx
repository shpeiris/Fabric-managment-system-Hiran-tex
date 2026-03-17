import React, { useState, useEffect } from 'react'
import { customerService } from '../../../services'
import './Dashboard.css' // Assuming there's a Dashboard.css or I'll create one

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    cartItems: 0,
    totalSpent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await customerService.getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="customer-dashboard">
      <h1>Welcome Back!</h1>
      <div className="dashboard-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Active Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
          <div className="summary-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p className="stat-value">Rs. {stats.totalSpent.toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Items in Cart</h3>
            <p className="stat-value">{stats.cartItems}</p>
          </div>
        </div>
      </div>
      <div className="recent-activity">
        <h3>Quick Summary</h3>
        <div className="activity-list">
          <p>You have {stats.pendingOrders} orders currently in progress.</p>
          {stats.cartItems > 0 && <p>You have {stats.cartItems} items waiting in your cart.</p>}
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard