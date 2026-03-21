import React from 'react'

const AdminInventory = () => {
  return (
    <div className="admin-inventory">
      <h1>Inventory Overview</h1>
      <div className="inventory-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Items</h3>
            <p>--</p>
          </div>
          <div className="summary-card">
            <h3>Low Stock Alerts</h3>
            <p className="alert-count">--</p>
          </div>
          <div className="summary-card">
            <h3>Out of Stock</h3>
            <p className="out-of-stock">--</p>
          </div>
        </div>
      </div>
      <div className="inventory-actions">
        <button>Generate Report</button>
        <button>Bulk Update</button>
        <button>Export Data</button>
      </div>
    </div>
  )
}

export default AdminInventory
