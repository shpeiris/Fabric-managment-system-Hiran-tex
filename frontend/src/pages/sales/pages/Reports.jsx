import { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import { Printer, TrendingUp, Calendar, ArrowUpRight, FileText, Box, Users, AlertTriangle } from 'lucide-react';
import "./Reports.css";



export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
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

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    SalesLogger.reports.pageLoad({ tab: activeTab, timestamp: new Date().toISOString() });
    refreshData();
  }, [activeTab]);

  const refreshData = () => {
    if (activeTab === 'sales') {
      fetchSalesReports();
      fetchInventoryReports();
    }
    if (activeTab === 'inventory') fetchInventoryReports();
    if (activeTab === 'suppliers') fetchSupplierReports();
  };

  const fetchSalesReports = async () => {
    try {
      setLoading(true);
      let url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/sales`;
      if (dateRange.startDate && dateRange.endDate) {
        url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await apiCall(url);
      const data = await response.json();

      if (response.ok) {
        setStats({
            totalSales: data.summary?.totalRevenue || 0,
            monthlySales: data.report ? Number(data.report[0]?.total_sales || 0) : 0,
            activeCustomers: data.activeCustomers || 0,
            pendingOrders: data.pendingOrders || 0,
            totalOrders: data.summary?.totalOrders || 0,
            avgOrderValue: data.summary?.avgOrderValue || 0,
            dailyTrend: data.report ? data.report.map(r => ({
                date: new Date(r.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                total: Number(r.total_sales),
                order_count: r.order_count
            })) : []
        });
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
        let url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/inventory`;
        if (dateRange.startDate && dateRange.endDate) {
          url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
        }
        const response = await apiCall(url);
        const data = await response.json();
        
        if (response.ok) {
            setInventoryData(data);
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
        let url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/reports/suppliers`;
        if (dateRange.startDate && dateRange.endDate) {
          url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
        }
        const response = await apiCall(url);
        const data = await response.json();
        
        if (response.ok) {
            setSupplierData(data);
        }
    } catch (err) {
        console.error('Error fetching supplier reports:', err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="reports-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1>Report Center</h1>
          <p className="subtitle">Comprehensive analytics for your business operations</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn-print"
            onClick={() => window.print()}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 16px', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0', 
              background: 'white', 
              color: '#64748b', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <Printer size={18} /> Print Report
          </button>
          
          <div className="report-filters" style={{ 
            display: 'flex', 
            gap: '12px', 
            alignItems: 'center',
            background: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            border: '1.5px solid #3b82f6',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#3b82f6" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Filter Range:</span>
          </div>
          <input 
            type="date" 
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          />
          <span style={{ color: '#94a3b8' }}>to</span>
          <input 
            type="date" 
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
          />
          <button 
            onClick={refreshData}
            style={{ 
              background: '#001a66', 
              color: 'white', 
              border: 'none', 
              padding: '6px 16px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >
            Apply
          </button>
          <button 
            onClick={() => {
              setDateRange({ startDate: '', endDate: '' });
              // Small timeout to ensure state is updated before fetch
              setTimeout(refreshData, 10);
            }}
            style={{ 
              background: 'transparent', 
              color: '#64748b', 
              border: '1px solid #e2e8f0', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              cursor: 'pointer' 
            }}
          >
            Reset
          </button>
        </div>
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
                  <h3>Total Revenue</h3>
                  <h2>Rs. {Number(stats.totalSales).toLocaleString()}</h2>
                  <p>Filtered period total</p>
                </div>
                <div className="stat-card">
                  <h3>Recent Sales</h3>
                  <h2>Rs. {Number(stats.monthlySales).toLocaleString()}</h2>
                  <p>Last recorded day</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <h2>{stats.totalOrders}</h2>
                  <p>Processed orders</p>
                </div>
                <div className="stat-card">
                  <h3>Active Customers</h3>
                  <h2>{stats.activeCustomers}</h2>
                  <p>Unique purchasers</p>
                </div>
                <div className="stat-card">
                  <h3>Pending Processing</h3>
                  <h2>{stats.pendingOrders}</h2>
                  <p>Awaiting attention</p>
                </div>
              </div>

              {/* Top Selling Fabrics Section */}
              <div className="report-section table-section" style={{ marginTop: '30px' }}>
                <div className="section-header">
                  <h3><Box size={20} /> Top Trending Fabrics</h3>
                </div>
                <div className="table-responsive">
                  <table className="performance-table">
                    <thead>
                      <tr>
                        <th>Fabric Name</th>
                        <th>Total Meters Sold</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryData.topSelling?.length > 0 ? inventoryData.topSelling.map((item, index) => (
                        <tr key={index}>
                          <td className="month-name">{item.name}</td>
                          <td style={{ fontWeight: 'bold', color: '#001a66' }}>{item.total_sold}m</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ 
                                  height: '100%', 
                                  background: '#3b82f6', 
                                  width: `${(item.total_sold / inventoryData.topSelling[0].total_sold) * 100}%` 
                                }}></div>
                              </div>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {Math.round((item.total_sold / inventoryData.topSelling[0].total_sold) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            No sales data available for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                <div className="stat-card">
                  <h3>Low Stock</h3>
                  <h2>{inventoryData.lowStockCount}</h2>
                  <p>Items near reorder level</p>
                </div>
                <div className="stat-card">
                  <h3>Out of Stock</h3>
                  <h2>{inventoryData.outOfStockCount}</h2>
                  <p>Zero quantity items</p>
                </div>
              </div>

              <div className="report-grid">
                <div className="report-section table-section">
                  <div className="section-header">
                    <h3><AlertTriangle size={20} color="#001a66" /> Critical Low Stock</h3>
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
                            <td style={{ color: item.stock_available_quantity === 0 ? '#001a66' : '#64748b', fontWeight: 'bold' }}>
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

    </div>
  );
}
