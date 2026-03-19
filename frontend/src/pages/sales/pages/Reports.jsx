import { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import { Printer, TrendingUp, Calendar, ArrowUpRight, FileText } from 'lucide-react';
import "./Reports.css";

export default function Reports() {
  const [stats, setStats] = useState({
    totalSales: 0,
    monthlySales: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    monthlyTrend: []
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
        setStats({
          ...data.stats,
          monthlyTrend: data.monthlyTrend || []
        });
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
      <div className="reports-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>Monthly Sales Report</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>View detailed sales analytics and performance metrics</p>
        </div>
        <button className="print-report-btn" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#001a66', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          <Printer size={18} />
          Print Report
        </button>
      </div>

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

      <div className="report-grid">
        {/* Visual Trend Section */}
        <div className="report-section chart-section">
          <div className="section-header">
            <h3><TrendingUp size={20} /> Sales Trend (Last 6 Months)</h3>
          </div>
          <div className="chart-container">
            {stats.monthlyTrend.length > 0 ? (
              <div className="bar-chart">
                {stats.monthlyTrend.slice().reverse().map((item, index) => {
                  const maxTotal = Math.max(...stats.monthlyTrend.map(m => m.total)) || 1;
                  const heightPercentage = (item.total / maxTotal) * 100;
                  return (
                    <div className="chart-bar-wrapper" key={index}>
                      <div className="bar-tooltip">Rs. {Number(item.total).toLocaleString()}</div>
                      <div className="bar" style={{ height: `${heightPercentage}%` }}></div>
                      <span className="bar-label">{item.month.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">Insufficient data for trend analysis</div>
            )}
          </div>
        </div>

        {/* Breakdown Table Section */}
        <div className="report-section table-section">
          <div className="section-header">
            <h3><Calendar size={20} /> Monthly Performance Breakdown</h3>
          </div>
          <div className="table-responsive">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.monthlyTrend.map((item, index) => (
                  <tr key={index}>
                    <td className="month-name">{item.month}</td>
                    <td>{item.order_count}</td>
                    <td className="revenue-cell">Rs. {Number(item.total).toLocaleString()}</td>
                    <td>
                      <span className="growth-tag">
                        <ArrowUpRight size={12} /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="report-section metrics-container">
        <h3><FileText size={20} /> Key Performance Indicators</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Average Order Value</span>
            <span className="metric-value">
              Rs. {stats.totalSales > 0 ? Number(stats.totalSales / (stats.totalCustomers || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Sales Representative</span>
            <span className="metric-value">Standard Mode</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Report Period</span>
            <span className="metric-value">FY 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}