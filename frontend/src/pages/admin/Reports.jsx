import { useState, useEffect } from "react";
import { apiCall } from "@/utils/auth.js";
import "./pages/Reports.css";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [salesReport, setSalesReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "sales") fetchSalesReport();
    if (activeTab === "inventory") fetchInventoryReport();
  }, [activeTab]);

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const res = await apiCall("http://localhost:5000/api/reports/sales");
      const data = await res.json();
      if (res.ok) setSalesReport(data.report || []);
    } catch (err) {
      console.error("Error fetching sales report:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      const res = await apiCall("http://localhost:5000/api/reports/inventory");
      const data = await res.json();
      if (res.ok) setInventoryReport(data);
    } catch (err) {
      console.error("Error fetching inventory report:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      <h1>Reports and Analytics</h1>
      <p className="subtitle">System performance insights.</p>

      {/* TABS */}
      <div className="report-tabs">
        <button className={activeTab === "sales" ? "active" : ""} onClick={() => setActiveTab("sales")}>
          Sales Report
        </button>
        <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>
          Inventory Report
        </button>
      </div>

      {loading && <p>Loading report data...</p>}

      {/* SALES REPORT */}
      {activeTab === "sales" && !loading && (
        <>
          <p className="note">Sales performance by date (Last 30 days).</p>
          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders Count</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesReport.length > 0 ? (
                salesReport.map((row, idx) => (
                  <tr key={idx}>
                    <td>{new Date(row.date).toLocaleDateString()}</td>
                    <td>{row.order_count}</td>
                    <td>Rs. {Number(row.total_sales).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No sales data available.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* INVENTORY REPORT */}
      {activeTab === "inventory" && !loading && inventoryReport && (
        <>
          <p className="note">Current Inventory Status</p>

          <div className="inventory-summary">
            <div className="summary-card">
              <h3>Total Inventory Value</h3>
              <p>Rs. {Number(inventoryReport.totalValue).toLocaleString()}</p>
            </div>
          </div>

          <h3>Low Stock Alert</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Fabric Name</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Expected Restock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryReport.lowStock.length > 0 ? (
                inventoryReport.lowStock.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.stock_available_quantity}</td>
                    <td>{item.reorder_level}</td>
                    <td style={{ color: item.stock_available_quantity === 0 ? '#dc2626' : '#059669', fontWeight: '500' }}>
                      {item.restock_date || 'Not Set'}
                    </td>
                    <td className="low">{item.stock_available_quantity === 0 ? 'Out of Stock' : 'Low Stock'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No items below reorder level.</td></tr>
              )}
            </tbody>
          </table>

          <h3>Top Selling Fabrics</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Fabric Name</th>
                <th>Total Sold (meters)</th>
              </tr>
            </thead>
            <tbody>
              {inventoryReport.topSelling.length > 0 ? (
                inventoryReport.topSelling.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.total_sold}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2">No sales data yet.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}