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
      const res = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/sales`);
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
      const res = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/inventory`);
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
              <h3>Total Meters in Stock</h3>
              <p>{Number(inventoryReport.totalMeters).toLocaleString()} m</p>
            </div>
            <div className="summary-card">
              <h3>Low Stock Items</h3>
              <p style={{ color: '#f59e0b' }}>{inventoryReport.lowStockCount}</p>
            </div>
            <div className="summary-card">
              <h3>Out of Stock</h3>
              <p style={{ color: '#dc2626' }}>{inventoryReport.outOfStockCount}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', margin: '30px 0' }}>
            <div className="report-box">
              <h3>Material Distribution</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Material Type</th>
                    <th>Count</th>
                    <th>Total Meters</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.materialDistribution.map((m, idx) => (
                    <tr key={idx}>
                      <td>{m.material_type || 'Unspecified'}</td>
                      <td>{m.count}</td>
                      <td>{Number(m.total_meters).toLocaleString()} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="report-box">
              <h3>Low Stock Alert</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Fabric Name</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.lowStock.length > 0 ? (
                    inventoryReport.lowStock.slice(0, 5).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.stock_available_quantity}</td>
                        <td className="low">{item.stock_available_quantity === 0 ? 'Out of Stock' : 'Low Stock'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3">All stock levels OK.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <h3>Fabric Inventory Overview</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Fabric Name</th>
                <th>Material</th>
                <th>Width</th>
                <th>Stock (m)</th>
                <th>Price /m</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {inventoryReport.allFabrics.length > 0 ? (
                inventoryReport.allFabrics.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.material_type}</td>
                    <td>{item.width || '—'}</td>
                    <td>{item.stock_available_quantity}</td>
                    <td>Rs. {Number(item.price_per_meter).toFixed(2)}</td>
                    <td>Rs. {Number(item.value).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No fabrics in system.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
