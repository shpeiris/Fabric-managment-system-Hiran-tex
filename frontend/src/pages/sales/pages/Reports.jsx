import { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import "./Reports.css";

export default function Reports() {
  const [stats, setStats] = useState({
    totalSales: 0,
    monthlySales: 0,
    totalCustomers: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    SalesLogger.reports.pageLoad({ timestamp: new Date().toISOString() });
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      SalesLogger.reports.reportsFetch({ action: 'fetch_reports_data' });
      const response = await apiCall('http://localhost:5000/api/sales/dashboard');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        SalesLogger.reports.reportsFetch({ 
          success: true,
          totalSales: data.stats?.totalSales || 0,
          totalCustomers: data.stats?.totalCustomers || 0
        });
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      SalesLogger.reports.reportsFetchError(err);
    }
  };

  return (
    <div className="reports-page">
      <h1>Sales Reports</h1>
      <p className="subtitle">View detailed sales analytics and performance metrics</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <h2>Rs. {Number(stats.totalSales).toLocaleString()}</h2>
          <p>All time revenue</p>
        </div>

        <div className="stat-card highlight">
          <h3>Monthly Sales</h3>
          <h2>Rs. {Number(stats.monthlySales).toLocaleString()}</h2>
          <p>Current month</p>
        </div>

        <div className="stat-card">
          <h3>Total Customers</h3>
          <h2>{stats.totalCustomers}</h2>
          <p>Active customers</p>
        </div>

        <div className="stat-card">
          <h3>Pending Orders</h3>
          <h2>{stats.pendingOrders}</h2>
          <p>Awaiting processing</p>
        </div>
      </div>

      <div className="report-section">
        <h3>📊 Performance Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Conversion Rate</span>
            <span className="metric-value">Coming Soon</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Average Order Value</span>
            <span className="metric-value">Coming Soon</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Customer Retention</span>
            <span className="metric-value">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}