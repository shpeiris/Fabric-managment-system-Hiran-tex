import React from 'react'
import './Dashboard.css'

const InventoryDashboard = () => {
  const lowStockAlerts = [
    { id: 'FAB001', name: 'Cotton Blue', currentStock: '10 meters', reorderLevel: '200 meters', supplier: 'Textile Co.', restockDate: '2026-02-15' },
    { id: 'FAB002', name: 'Silk Satin Red', currentStock: '15 meters', reorderLevel: '200 meters', supplier: 'Luxury Fabrics Inc.', restockDate: '2026-02-10' },
    { id: 'FAB003', name: 'Polyester white', currentStock: '25 meters', reorderLevel: '200 meters', supplier: 'Woolens Ltd.', restockDate: '2026-02-20' }
  ]

  const recentTransactions = [
    { id: 'TXN001', type: 'Purchase', fabric: 'Cotton Blend', quantity: '200 meters', date: '2024-07-20', status: 'Completed' },
    { id: 'TXN002', type: 'Sale', fabric: 'Silk Satin', quantity: '50 meters', date: '2024-07-21', status: 'Completed' }
  ]

  return (
    <div className="inventory-dashboard">
      <h1>Inventory Dashboard</h1>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Stock Value</div>
          <div className="value">Rs.<br/>2,345,600</div>
        </div>
        <div className="stat-card">
          <div className="label">Low Stock Items</div>
          <div className="value">8 Items</div>
        </div>
        <div className="stat-card">
          <div className="label">Pending Orders</div>
          <div className="value">12 orders</div>
        </div>
        <div className="stat-card">
          <div className="label">New Arrivals</div>
          <div className="value">5 items</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', marginTop: '30px' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', textAlign: 'center', cursor: 'pointer' }}>
          <img 
            src="https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400" 
            alt="Create Order"
            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }}
          />
          <p style={{ fontWeight: '500', fontSize: '14px' }}>Create Order</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', textAlign: 'center', cursor: 'pointer' }}>
          <img 
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400" 
            alt="Add Supplier"
            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }}
          />
          <p style={{ fontWeight: '500', fontSize: '14px' }}>Add Supplier</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', textAlign: 'center', cursor: 'pointer' }}>
          <img 
            src="https://images.unsplash.com/photo-1593032465171-b9a5cc3c52b8?w=400" 
            alt="New stock"
            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }}
          />
          <p style={{ fontWeight: '500', fontSize: '14px' }}>New stock</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Low Stock Alerts</h3>
      <table className="data-table" style={{ marginBottom: '30px' }}>
        <thead>
          <tr>
            <th>Fabric ID</th>
            <th>Name</th>
            <th>Current Stock</th>
            <th>Reorder Level</th>
            <th>Supplier</th>
            <th>Expected Restock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {lowStockAlerts.map((alert) => (
            <tr key={alert.id}>
              <td className="link-text">{alert.id}</td>
              <td>{alert.name}</td>
              <td>{alert.currentStock}</td>
              <td>{alert.reorderLevel}</td>
              <td>{alert.supplier}</td>
              <td style={{ color: '#059669', fontWeight: '500' }}>{alert.restockDate}</td>
              <td>
                <button style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                  Place Order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Recent Transactions */}
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Recent Transactions</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Type</th>
            <th>Fabric</th>
            <th>Quantity</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentTransactions.map((txn) => (
            <tr key={txn.id}>
              <td className="link-text">{txn.id}</td>
              <td>{txn.type}</td>
              <td>{txn.fabric}</td>
              <td>{txn.quantity}</td>
              <td className="date-text">{txn.date}</td>
              <td>
                <span style={{
                  background: '#d1fae5',
                  color: '#065f46',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {txn.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryDashboard