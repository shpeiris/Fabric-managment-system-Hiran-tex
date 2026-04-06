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
      if (res.ok) setSalesReport(data);
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
      {activeTab === "sales" && !loading && salesReport && (
        <>
          <p className="note">Comprehensive sales overview and recent performance.</p>

          {salesReport.summary && (
            <div className="inventory-summary">
              <div className="summary-card">
                <h3>Total Revenue</h3>
                <p>Rs. {salesReport.summary.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="summary-card">
                <h3>Total Orders</h3>
                <p>{salesReport.summary.totalOrders}</p>
              </div>
              <div className="summary-card">
                <h3>Unique Customers</h3>
                <p>{salesReport.summary.uniqueCustomers}</p>
              </div>
              <div className="summary-card">
                <h3>Avg. Order Value</h3>
                <p>Rs. {Number(salesReport.summary.avgOrderValue).toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="report-box" style={{ margin: '30px 0' }}>
            <h3>Daily Sales Performance</h3>
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.dailySales?.length > 0 ? (
                    salesReport.dailySales.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(row.date).toLocaleDateString()}</td>
                        <td>{row.order_count}</td>
                        <td>Rs. {Number(row.total_sales).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3">No sales metrics recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="report-box" style={{ marginBottom: '40px' }}>
            <h3>Monthly Transactions</h3>
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.monthlyOrders?.length > 0 ? (
                    salesReport.monthlyOrders.map((o, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>#{o.order_id}</td>
                        <td>{o.customer_name}</td>
                        <td>{new Date(o.order_date).toLocaleDateString()}</td>
                        <td>Rs. {Number(o.total_amount).toLocaleString()}</td>
                        <td>
                          <span style={{ 
                            fontSize: '11px', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            background: o.order_status === 'COMPLETED' ? '#e8f5e9' : '#fff3e0',
                            color: o.order_status === 'COMPLETED' ? '#2e7d32' : '#ef6c00'
                          }}>
                            {o.order_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5">No transactions this month.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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

          <div className="report-box" style={{ margin: '30px 0' }}>
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

          <div className="report-box" style={{ marginBottom: '30px' }}>
            <h3>Recent Stock Arrivals</h3>
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Arrival ID</th>
                    <th>Date</th>
                    <th>Fabric</th>
                    <th>Supplier</th>
                    <th>Quantity</th>
                    <th>Total Value</th>
                    <th>Received By</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryReport.recentArrivals?.length > 0 ? (
                    inventoryReport.recentArrivals.map((arrival) => (
                      <tr key={arrival.arrival_id}>
                        <td style={{ fontWeight: 600 }}>#ARV-{arrival.arrival_id.toString().padStart(3, '0')}</td>
                        <td>{new Date(arrival.arrival_date).toLocaleDateString()}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{arrival.fabric_name}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>
                            {arrival.material_type} — {arrival.color || 'No Color'} ({arrival.design || 'Plain'})
                          </div>
                        </td>
                        <td>{arrival.supplier_name}</td>
                        <td>
                          <div>{arrival.quantity} m</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>Rs. {Number(arrival.supply_unit_price).toFixed(2)}/m</div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>
                          Rs. {Number(arrival.total_value).toLocaleString()}
                        </td>
                        <td style={{ fontSize: '12px', color: '#666' }}>
                          {arrival.received_by_name || "System/Admin"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7">No recent stock arrivals found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <h3>Fabric Inventory Overview</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fabric Name</th>
                <th>Material</th>
                <th>Supplier</th>
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
                    <td>#{item.fabric_id}</td>
                    <td>{item.name}</td>
                    <td>{item.material_type}</td>
                    <td style={{ fontStyle: item.supplier_name ? 'normal' : 'italic', color: item.supplier_name ? 'inherit' : '#999' }}>
                      {item.supplier_name || 'No Supplier'}
                    </td>
                    <td>{item.width || '—'}</td>
                    <td>{item.stock_available_quantity}</td>
                    <td>Rs. {Number(item.price_per_meter).toFixed(2)}</td>
                    <td>Rs. {Number(item.value).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8">No fabrics in system.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
