import { useState, useEffect } from "react";
import { apiCall } from "@/utils/auth.js";
import "./pages/Reports.css";

export default function Reports() {
  // State variables to remember which tab we are on and store the fetched data
  const [activeTab, setActiveTab] = useState("sales");
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Automatically fetch data whenever the user switches tabs (sales vs inventory)
  useEffect(() => {
    if (activeTab === "sales") fetchSalesReport();
    if (activeTab === "inventory") fetchInventoryReport();
  }, [activeTab]);

  // Fetches financial and order data from the backend
  const fetchSalesReport = async (startDate = "", endDate = "") => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/sales`;
      if (startDate) url += `?startDate=${startDate}`;
      if (endDate) url += `${startDate ? '&' : '?'}endDate=${endDate}`;
      
      const res = await apiCall(url);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Reports and Analytics</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
           <input 
             type="date" 
             style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
             onChange={(e) => fetchSalesReport(e.target.value)} 
           />
        </div>
      </div>

      {/* TABS Navigation: Buttons to switch between Sales and Inventory views */}
      <div className="report-tabs">
        <button className={activeTab === "sales" ? "active" : ""} onClick={() => setActiveTab("sales")}>
          Sales Report
        </button>
        <button className={activeTab === "inventory" ? "active" : ""} onClick={() => setActiveTab("inventory")}>
          Inventory Report
        </button>
      </div>

      {/* Show a loading message while waiting for the server */}
      {loading && <p>Loading report data...</p>}

      {/* --- SECTION: SALES REPORT VIEW --- */}
      {/* Only show this section if the "Sales" tab is selected AND data has finished loading */}
      {activeTab === "sales" && !loading && salesReport && (
        <>
          <p className="note">Comprehensive sales overview and recent performance.</p>

          {/* 1. Quick Overview Cards at the top (Revenue, Fees, Order Count) */}
          {salesReport.summary && (
            <div className="inventory-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="summary-card" style={{ background: '#f8fafc', borderLeft: '4px solid #001a66' }}>
                <h3>Total Revenue</h3>
                <p style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>Rs. {salesReport.summary.totalRevenue.toLocaleString()}</p>
                <small style={{ color: '#64748b' }}>Combined Total</small>
              </div>
              <div className="summary-card" style={{ background: '#f8fafc', borderLeft: '4px solid #059669' }}>
                <h3>Product Sales</h3>
                <p style={{ color: '#059669', fontWeight: 'bold' }}>Rs. {salesReport.summary.productRevenue.toLocaleString()}</p>
                <small style={{ color: '#64748b' }}>Fabric value</small>
              </div>
              <div className="summary-card" style={{ background: '#f8fafc', borderLeft: '4px solid #2563eb' }}>
                <h3>Delivery Fees</h3>
                <p style={{ color: '#2563eb', fontWeight: 'bold' }}>Rs. {salesReport.summary.deliveryRevenue.toLocaleString()}</p>
                <small style={{ color: '#64748b' }}>Shipping collected</small>
              </div>
              <div className="summary-card">
                <h3>Total Orders</h3>
                <p>{salesReport.summary.totalOrders}</p>
              </div>
            </div>
          )}

          {/* 2. Table showing how much was made each day */}
          <div className="report-box" style={{ margin: '30px 0' }}>
            <h3>Daily Sales Performance</h3>
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Orders</th>
                    <th>Product Sales</th>
                    <th>Delivery Fees</th>
                    <th>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                    {salesReport.dailySales?.length > 0 ? (
                      salesReport.dailySales.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ whiteSpace: 'nowrap' }}>{new Date(row.date).toLocaleDateString()}</td>
                          <td>{row.order_count}</td>
                          <td>Rs. {Number(row.product_sales).toLocaleString()}</td>
                          <td>Rs. {Number(row.delivery_sales).toLocaleString()}</td>
                          <td style={{ fontWeight: 'bold' }}>Rs. {Number(row.total_sales).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                    <tr><td colSpan="5">No sales metrics recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Table showing the latest individual customer orders */}
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
                  {salesReport.detailedOrders?.length > 0 ? (
                    salesReport.detailedOrders.map((o, idx) => (
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
                            background: o.order_status === 'DELIVERED' ? '#e8f5e9' : '#fff3e0',
                            color: o.order_status === 'DELIVERED' ? '#2e7d32' : '#ef6c00'
                          }}>
                            {o.order_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5">No transaction records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Table showing which fabric items sell the fastest */}
          <div className="report-box" style={{ marginBottom: '40px' }}>
            <h3>Top Performing Fabrics</h3>
            <div className="table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Fabric Name</th>
                    <th>Meters Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.topSelling?.length > 0 ? (
                    salesReport.topSelling.map((f, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{f.name}</td>
                        <td>{Number(f.total_meters).toLocaleString()} m</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>Rs. {Number(f.total_revenue).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3">No sales record found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* --- SECTION: INVENTORY REPORT VIEW --- */}
      {/* Only show this section if the "Inventory" tab is selected AND data has finished loading */}
      {activeTab === "inventory" && !loading && inventoryReport && (
        <>
          <p className="note">Current Inventory Status</p>

          {/* 1. Quick Overview Cards at the top (Total Stock, Empty Stock count) */}
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

          {/* 2. Table showing items that are running out or completely empty */}
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

          {/* 3. Table showing the latest supply boxes that arrived at the store */}
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
