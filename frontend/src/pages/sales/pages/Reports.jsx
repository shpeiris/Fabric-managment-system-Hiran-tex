import { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import { Printer, TrendingUp, Calendar, ArrowUpRight, FileText, Box, Users, AlertTriangle } from 'lucide-react';
import "./Reports.css";

const DUMMY_TREND = [
  { month: 'Oct 2025', total: 45200, order_count: 12 },
  { month: 'Nov 2025', total: 58900, order_count: 15 },
  { month: 'Dec 2025', total: 92450, order_count: 24 },
  { month: 'Jan 2026', total: 67800, order_count: 18 },
  { month: 'Feb 2026', total: 84300, order_count: 21 },
  { month: 'Mar 2026', total: 76800, order_count: 19 }
];

const DUMMY_INVENTORY = {
    totalItems: 142,
    lowStockCount: 8,
    outOfStockCount: 3,
    totalValue: 1245700,
    lowStock: [
        { name: 'Premium Silk Satin (Blue)', stock_available_quantity: 2.5, reorder_level: 10, price_per_meter: 2400 },
        { name: 'Egyptian Cotton (White)', stock_available_quantity: 4.8, reorder_level: 15, price_per_meter: 1850 },
        { name: 'Linen Blend (Sand)', stock_available_quantity: 0, reorder_level: 10, price_per_meter: 1200 },
        { name: 'Floral Viscose (Red)', stock_available_quantity: 1.2, reorder_level: 5, price_per_meter: 950 },
        { name: 'Denim Indigo 12oz', stock_available_quantity: 8.4, reorder_level: 20, price_per_meter: 1100 }
    ],
    materialDistribution: [
        { material_type: 'Silk', count: 24, total_meters: 450.5 },
        { material_type: 'Cotton', count: 42, total_meters: 1240.2 },
        { material_type: 'Linen', count: 18, total_meters: 320.8 },
        { material_type: 'Polyester', count: 35, total_meters: 2100.4 },
        { material_type: 'Wool', count: 12, total_meters: 145.2 },
        { material_type: 'Rayon', count: 11, total_meters: 98.6 }
    ]
};

const DUMMY_SUPPLIERS = {
    stats: {
        totalSuppliers: 12,
        allTimeSupplyValue: 3450000,
        recentArrivalsCount: 9
    },
    suppliers: [
        { name: 'Global Textiles Ltd', contact_person: 'John Smith', fulfillment_count: 45, total_quantity: 4500, total_value: 1200000, last_arrival: '2026-03-15' },
        { name: 'Elite Fabrics Inc', contact_person: 'Sarah Jane', fulfillment_count: 32, total_quantity: 3200, total_value: 950000, last_arrival: '2026-03-10' },
        { name: 'Premium Weaves', contact_person: 'Mike Ross', fulfillment_count: 28, total_quantity: 1800, total_value: 650000, last_arrival: '2026-03-18' },
        { name: 'Traditional Cottons', contact_person: 'A. Perera', fulfillment_count: 15, total_quantity: 1200, total_value: 420000, last_arrival: '2026-02-28' }
    ],
    recentArrivals: [
        { arrival_date: '2026-03-18', fabric_name: 'Premium Silk Satin', supplier_name: 'Premium Weaves', quantity: 50, supply_unit_price: 1800, total_value: 90000 },
        { arrival_date: '2026-03-15', fabric_name: 'Egyptian Cotton', supplier_name: 'Global Textiles Ltd', quantity: 200, supply_unit_price: 1200, total_value: 240000 },
        { arrival_date: '2026-03-12', fabric_name: 'Linen Blend', supplier_name: 'Elite Fabrics Inc', quantity: 150, supply_unit_price: 900, total_value: 135000 },
        { arrival_date: '2026-03-10', fabric_name: 'Denim Indigo', supplier_name: 'Elite Fabrics Inc', quantity: 300, supply_unit_price: 750, total_value: 225000 },
        { arrival_date: '2026-03-05', fabric_name: 'Floral Viscose', supplier_name: 'Global Textiles Ltd', quantity: 100, supply_unit_price: 600, total_value: 60000 }
    ]
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [isDemoData, setIsDemoData] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState({
    totalSales: 0,
    monthlySales: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    dailyTrend: []
  });

  const [inventoryData, setInventoryData] = useState({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
    lowStock: [],
    materialDistribution: []
  });

  const [supplierData, setSupplierData] = useState({
    suppliers: [],
    stats: {
        totalSuppliers: 0,
        allTimeSupplyValue: 0,
        recentArrivalsCount: 0
    },
    recentArrivals: []
  });

  useEffect(() => {
    SalesLogger.reports.pageLoad({ tab: activeTab, timestamp: new Date().toISOString() });
    if (activeTab === 'sales') fetchSalesReports();
    if (activeTab === 'inventory') fetchInventoryReports();
    if (activeTab === 'suppliers') fetchSupplierReports();
  }, [activeTab]);

  const fetchSalesReports = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/sales`);
      const data = await response.json();

      if (response.ok) {
        const hasLiveTrend = data.report && data.report.length > 0;
        setIsDemoData(!hasLiveTrend);
        
        // Map backend report (results array) to stats
        if (hasLiveTrend) {
            setStats({
                totalSales: data.report.reduce((acc, curr) => acc + Number(curr.total_sales), 0),
                monthlySales: Number(data.report[0]?.total_sales || 0),
                activeCustomers: data.activeCustomers || 0,
                pendingOrders: 5,
                dailyTrend: data.report.map(r => ({
                    date: new Date(r.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                    total: Number(r.total_sales),
                    order_count: r.order_count
                }))
            });
        } else {
            // Use Dummy Data if empty
            setStats({
                totalSales: 426400,
                monthlySales: 76800,
                totalCustomers: 104,
                pendingOrders: 8,
                dailyTrend: DUMMY_TREND.map(d => ({ ...d, date: d.month.split(' ')[0] }))
            });
        }
      }
    } catch (err) {
      console.error('Error fetching sales reports:', err);
    } finally {
        setLoading(false);
    }
  };

  const fetchInventoryReports = async () => {
    try {
        setLoading(true);
        const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/inventory`);
        const data = await response.json();
        
        if (response.ok) {
            const hasData = data.totalItems > 0 || data.lowStock?.length > 0;
            setIsDemoData(!hasData);
            setInventoryData(hasData ? data : DUMMY_INVENTORY);
        }
    } catch (err) {
        console.error('Error fetching inventory reports:', err);
    } finally {
        setLoading(false);
    }
  };

  const fetchSupplierReports = async () => {
    try {
        setLoading(true);
        const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/suppliers`);
        const data = await response.json();
        
        if (response.ok) {
            const hasData = data.suppliers?.length > 0 || data.stats?.totalSuppliers > 0;
            setIsDemoData(!hasData);
            setSupplierData(hasData ? data : DUMMY_SUPPLIERS);
        }
    } catch (err) {
        console.error('Error fetching supplier reports:', err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1>Report Center</h1>
            {isDemoData && (
              <span className="demo-badge" style={{ backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                Demo Data Active
              </span>
            )}
          </div>
          <p className="subtitle" style={{ marginBottom: 0 }}>Comprehensive analytics for your business operations</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="report-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <button 
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'sales' ? '#001a66' : 'transparent', color: activeTab === 'sales' ? 'white' : '#64748b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          <TrendingUp size={18} /> Sales
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'inventory' ? '#001a66' : 'transparent', color: activeTab === 'inventory' ? 'white' : '#64748b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          <Box size={18} /> Inventory
        </button>
        <button 
          className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'suppliers' ? '#001a66' : 'transparent', color: activeTab === 'suppliers' ? 'white' : '#64748b', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
        >
          <Users size={18} /> Suppliers
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
          <TrendingUp size={48} className="animate-pulse" style={{ margin: '0 auto 20px', opacity: 0.2 }} />
          <p>Analyzing system data... please wait</p>
        </div>
      ) : (
        <>
          {activeTab === 'sales' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Sales</h3>
                  <h2>Rs. {Number(stats.totalSales).toLocaleString()}</h2>
                  <p>All time revenue</p>
                </div>
                <div className="stat-card highlight">
                  <h3>Recent Sales</h3>
                  <h2>Rs. {Number(stats.monthlySales).toLocaleString()}</h2>
                  <p>Last recorded day</p>
                </div>
                <div className="stat-card highlight">
                  <h3>Active Customers</h3>
                  <h2>{stats.activeCustomers}</h2>
                  <p>Customers with orders</p>
                </div>
                <div className="stat-card">
                  <h3>Pending Orders</h3>
                  <h2>{stats.pendingOrders}</h2>
                  <p>Awaiting processing</p>
                </div>
              </div>

              <div className="report-grid">
                <div className="report-section chart-section">
                  <div className="section-header">
                    <h3><TrendingUp size={20} /> Daily Sales Trend</h3>
                  </div>
                  <div className="chart-container">
                    {stats.dailyTrend.length > 0 ? (
                      <div className="bar-chart">
                        {stats.dailyTrend.slice().reverse().map((item, index) => {
                          const maxTotal = Math.max(...stats.dailyTrend.map(m => m.total)) || 1;
                          const heightPercentage = (item.total / maxTotal) * 100;
                          return (
                            <div className="chart-bar-wrapper" key={index}>
                              <div className="bar-tooltip">Rs. {Number(item.total).toLocaleString()}</div>
                              <div className="bar" style={{ height: `${heightPercentage}%` }}></div>
                              <span className="bar-label">{item.date}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="no-data">Insufficient data for trend analysis</div>
                    )}
                  </div>
                </div>

                <div className="report-section table-section">
                  <div className="section-header">
                    <h3><Calendar size={20} /> Daily Performance Breakdown</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Orders</th>
                          <th>Revenue</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.dailyTrend.map((item, index) => (
                          <tr key={index}>
                            <td className="month-name">{item.date}</td>
                            <td>{item.order_count}</td>
                            <td className="revenue-cell">Rs. {Number(item.total).toLocaleString()}</td>
                            <td><span className="growth-tag"><ArrowUpRight size={12} /> Live</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'inventory' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Items</h3>
                  <h2>{inventoryData.totalItems}</h2>
                  <p>Unique fabrics</p>
                </div>
                <div className="stat-card highlight">
                  <h3>Inventory Value</h3>
                  <h2>Rs. {Number(inventoryData.totalValue).toLocaleString()}</h2>
                  <p>Current stock worth</p>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <h3>Low Stock</h3>
                  <h2 style={{ color: '#d97706' }}>{inventoryData.lowStockCount}</h2>
                  <p>Items near reorder level</p>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <h3>Out of Stock</h3>
                  <h2 style={{ color: '#dc2626' }}>{inventoryData.outOfStockCount}</h2>
                  <p>Zero quantity items</p>
                </div>
              </div>

              <div className="report-grid">
                <div className="report-section table-section">
                  <div className="section-header">
                    <h3><AlertTriangle size={20} color="#f59e0b" /> Critical Low Stock</h3>
                  </div>
                  <div className="table-responsive">
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>Fabric Name</th>
                          <th>Stock</th>
                          <th>Level</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.lowStock?.length > 0 ? inventoryData.lowStock.map((item, idx) => (
                          <tr key={idx}>
                            <td className="month-name">{item.name}</td>
                            <td style={{ color: item.stock_available_quantity === 0 ? 'red' : 'orange', fontWeight: 'bold' }}>
                                {item.stock_available_quantity}m
                            </td>
                            <td>{item.reorder_level}m</td>
                            <td>Rs. {Number(item.price_per_meter * item.stock_available_quantity).toLocaleString()}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>All inventory levels are currently healthy</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="report-section chart-section">
                  <div className="section-header">
                    <h3><Box size={20} /> Material Distribution</h3>
                  </div>
                  <div className="material-list" style={{ padding: '20px' }}>
                    {inventoryData.materialDistribution?.map((m, idx) => (
                      <div key={idx} className="material-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#001a66' }}></span>
                            <span style={{ fontWeight: '600' }}>{m.material_type || 'Other'}</span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            <span style={{ marginRight: '15px' }}>{m.count} items</span>
                            <strong>{Number(m.total_meters).toFixed(1)}m</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'suppliers' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Suppliers</h3>
                  <h2>{supplierData.stats.totalSuppliers}</h2>
                  <p>Active partners</p>
                </div>
                <div className="stat-card highlight">
                  <h3>Purchase Volume</h3>
                  <h2>Rs. {Number(supplierData.stats.allTimeSupplyValue).toLocaleString()}</h2>
                  <p>All-time supply cost</p>
                </div>
                <div className="stat-card">
                  <h3>Recent Arrivals</h3>
                  <h2>{supplierData.stats.recentArrivalsCount}</h2>
                  <p>Last 30 days</p>
                </div>
              </div>

              <div className="report-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="report-section table-section">
                    <div className="section-header">
                        <h3><Users size={20} /> Supplier Performance & Fulfillment</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="performance-table">
                            <thead>
                                <tr>
                                    <th>Supplier Name</th>
                                    <th>Contact</th>
                                    <th>Fulfillment</th>
                                    <th>Total Quantity</th>
                                    <th>Total Value</th>
                                    <th>Last Arrival</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierData.suppliers?.map((s, idx) => (
                                    <tr key={idx}>
                                        <td className="month-name">{s.name}</td>
                                        <td>{s.contact_person || 'N/A'}</td>
                                        <td>{s.fulfillment_count} orders</td>
                                        <td>{Number(s.total_quantity).toLocaleString()}m</td>
                                        <td className="revenue-cell">Rs. {Number(s.total_value).toLocaleString()}</td>
                                        <td>{s.last_arrival ? new Date(s.last_arrival).toLocaleDateString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="report-section table-section">
                    <div className="section-header">
                        <h3><FileText size={20} /> Recent Stock Inward Logs</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="performance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Fabric</th>
                                    <th>Supplier</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierData.recentArrivals?.length > 0 ? supplierData.recentArrivals.map((arrival, idx) => (
                                    <tr key={idx}>
                                        <td>{new Date(arrival.arrival_date).toLocaleDateString()}</td>
                                        <td className="month-name">{arrival.fabric_name}</td>
                                        <td>{arrival.supplier_name}</td>
                                        <td>{arrival.quantity}m</td>
                                        <td>Rs. {Number(arrival.supply_unit_price).toLocaleString()}</td>
                                        <td className="revenue-cell">Rs. {Number(arrival.total_value).toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No recent stock arrivals recorded</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <div className="report-section metrics-container">
        <h3><FileText size={20} /> Report Metadata</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Generated By</span>
            <span className="metric-value">Sales Representative</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Access Level</span>
            <span className="metric-value">Standard Authorization</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">System Time</span>
            <span className="metric-value">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
