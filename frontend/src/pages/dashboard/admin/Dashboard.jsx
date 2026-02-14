import React from 'react'

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>--</p>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>--</p>
          </div>
          <div className="stat-card">
            <h3>Fabric Inventory</h3>
            <p>--</p>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p>--</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard