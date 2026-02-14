import { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import "./InventoryDashboard.css";

export default function InventoryDashboard() {
  const [fabrics, setFabrics] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStockValue: 0,
    lowStockItems: 0,
    totalFabrics: 0,
    recentArrivals: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsRes = await apiCall('http://localhost:5000/api/inventory/dashboard');
      const statsData = await statsRes.json();

      // Fetch fabrics
      const fabricsRes = await apiCall('http://localhost:5000/api/inventory/fabrics');
      const fabricsData = await fabricsRes.json();

      // Fetch recent arrivals
      const arrivalsRes = await apiCall('http://localhost:5000/api/inventory/stock-arrivals');
      const arrivalsData = await arrivalsRes.json();

      if (statsRes.ok && fabricsRes.ok && arrivalsRes.ok) {
        const fabricsList = fabricsData.fabrics || [];
        const arrivalsList = arrivalsData.arrivals || [];

        setFabrics(fabricsList);
        setArrivals(arrivalsList.slice(0, 5));
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const lowStockFabrics = fabrics.filter(f => f.stock_status === 'LOW').slice(0, 5);

  return (
    <div className="inventory-dashboard">
      <h1>Inventory Dashboard</h1>
      <p className="subtitle">Manage your fabric inventory and stock levels</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h4>Total Stock Value</h4>
            <h2>Rs. {stats.totalStockValue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h4>Low Stock Items</h4>
            <h2>{stats.lowStockItems}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h4>Total Fabrics</h4>
            <h2>{stats.totalFabrics}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📥</div>
          <div className="stat-info">
            <h4>Recent Arrivals</h4>
            <h2>{stats.recentArrivals}</h2>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="section">
        <h3>⚠️ Low Stock Alerts</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fabric ID</th>
                <th>Name</th>
                <th>Material</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Expected Restock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockFabrics.length > 0 ? (
                lowStockFabrics.map(fabric => (
                  <tr key={fabric.fabric_id}>
                    <td>#{fabric.fabric_id}</td>
                    <td>{fabric.name}</td>
                    <td>{fabric.material_type}</td>
                    <td className="low-stock">{fabric.stock_quantity} m</td>
                    <td>{fabric.reorder_level} m</td>
                    <td style={{
                      color: parseFloat(fabric.stock_quantity) === 0 ? '#dc2626' : '#059669',
                      fontWeight: '500'
                    }}>
                      {fabric.restock_date || 'Not Set'}
                    </td>
                    <td>
                      <button className="btn-primary">
                        {parseFloat(fabric.stock_quantity) === 0 ? 'Urgent Order' : 'Order Stock'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    ✅ All fabrics have adequate stock
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Stock Arrivals */}
      <div className="section">
        <h3>📥 Recent Stock Arrivals</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fabric</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {arrivals.length > 0 ? (
                arrivals.map(arrival => (
                  <tr key={arrival.arrival_id}>
                    <td>{new Date(arrival.arrival_date).toLocaleDateString()}</td>
                    <td>{arrival.fabric_name}</td>
                    <td>{arrival.supplier_name}</td>
                    <td>{arrival.quantity} m</td>
                    <td>Rs. {Number(arrival.supply_unit_price).toFixed(2)}</td>
                    <td>Rs. {Number(arrival.total_value).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No recent arrivals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
