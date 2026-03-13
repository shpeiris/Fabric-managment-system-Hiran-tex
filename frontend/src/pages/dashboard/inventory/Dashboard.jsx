import React, { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import './Dashboard.css';

const InventoryDashboard = () => {
  const [stats, setStats] = useState({
    totalStockValue: 0,
    lowStockItems: 0,
    totalFabrics: 0,
    recentArrivals: 0
  });
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch General Stats
      const statsRes = await apiCall('http://localhost:5000/api/inventory/dashboard');
      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(statsData.stats);

      // Fetch Low Stock Fabrics
      const fabricsRes = await apiCall('http://localhost:5000/api/inventory/fabrics');
      const fabricsData = await fabricsRes.json();
      if (fabricsRes.ok) {
        const lowStock = (fabricsData.fabrics || []).filter(f => 
          f.stock_quantity <= f.reorder_level
        ).slice(0, 5);
        setLowStockAlerts(lowStock);
      }

      // Fetch Recent Stock Arrivals
      const arrivalsRes = await apiCall('http://localhost:5000/api/inventory/stock-arrivals');
      const arrivalsData = await arrivalsRes.json();
      if (arrivalsRes.ok) {
        setRecentTransactions((arrivalsData.arrivals || []).slice(0, 5));
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="inventory-dashboard">Loading dashboard...</div>;

  return (
    <div className="inventory-dashboard">
      <h1>Inventory Dashboard</h1>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Stock Value</div>
          <div className="value">Rs.<br/>{stats.totalStockValue?.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="label">Low Stock Items</div>
          <div className="value">{stats.lowStockItems} Items</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Fabrics</div>
          <div className="value">{stats.totalFabrics} types</div>
        </div>
        <div className="stat-card">
          <div className="label">Recent Arrivals</div>
          <div className="value">{stats.recentArrivals} items</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="section-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        <div className="action-card">
          <div className="action-image stock-in"></div>
          <p>Record Arrival</p>
        </div>
        <div className="action-card">
          <div className="action-image add-fabric"></div>
          <p>New Fabric</p>
        </div>
        <div className="action-card">
          <div className="action-image suppliers"></div>
          <p>Manage Suppliers</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <h3 className="section-title">Critical Low Stock</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fabric Name</th>
              <th>Material</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lowStockAlerts.length > 0 ? (
              lowStockAlerts.map((fabric) => (
                <tr key={fabric.fabric_id}>
                  <td className="link-text">#FAB{fabric.fabric_id}</td>
                  <td style={{ fontWeight: '500' }}>{fabric.name}</td>
                  <td>{fabric.material_type}</td>
                  <td style={{ color: '#dc2626', fontWeight: 'bold' }}>{fabric.stock_quantity} m</td>
                  <td>{fabric.reorder_level} m</td>
                  <td>
                    <span className="status-badge low">Low Stock</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="empty-state">No low stock items detected.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <h3 className="section-title">Recent Stock Arrivals</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Arrival ID</th>
              <th>Fabric</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((txn) => (
                <tr key={txn.arrival_id}>
                  <td className="link-text">#ARR{txn.arrival_id}</td>
                  <td>{txn.fabric_name}</td>
                  <td>{txn.supplier_name}</td>
                  <td>{txn.quantity} m</td>
                  <td className="date-text">{new Date(txn.arrival_date).toLocaleDateString()}</td>
                  <td>
                    <span className="status-badge completed">Received</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="empty-state">No recent arrivals.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryDashboard;