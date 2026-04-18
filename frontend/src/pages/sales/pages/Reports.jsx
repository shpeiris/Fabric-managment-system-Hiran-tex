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
            productSales: data.summary?.productRevenue || 0,
            deliverySales: data.summary?.deliveryRevenue || 0,
            monthlySales: data.dailySales?.length > 0 ? Number(data.dailySales[0]?.total_sales || 0) : 0,
            activeCustomers: data.activeCustomers || 0,
            pendingOrders: data.pendingOrders || 0,
            totalOrders: data.summary?.totalOrders || 0,
            avgOrderValue: data.summary?.avgOrderValue || 0,
            detailedOrders: data.detailedOrders || [],
            topSelling: data.topSelling || [],
            dailyPerformance: data.dailySales || [],
            dailyTrend: data.dailySales ? data.dailySales.map(r => ({
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1>Report Center</h1>
          <p className="subtitle">Comprehensive analytics for your business operations</p>
        </div>
        <div className="date-filter-standalone" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <Calendar size={18} color="#001a66" />
          <input 
            type="date" 
            value={dateRange.startDate} 
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 10px', fontSize: '13px' }}
          />
          <span style={{ color: '#64748b' }}>to</span>
          <input 
            type="date" 
            value={dateRange.endDate} 
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 10px', fontSize: '13px' }}
          />
          <button 
            onClick={refreshData}
            style={{ background: '#001a66', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Apply
          </button>
        </div>
      </div>

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
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #001a66 0%, #002a99 100%)', color: 'white' }}>
                  <h3 style={{ color: 'rgba(255,255,255,0.8)' }}>Total Revenue</h3>
                  <h2 style={{ color: 'white' }}>Rs. {Number(stats.totalSales).toLocaleString()}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>Combined Total</p>
                </div>
                <div className="stat-card">
                  <h3 style={{ color: '#059669' }}>Fabric Sales</h3>
                  <h2 style={{ color: '#059669' }}>Rs. {Number(stats.productSales).toLocaleString()}</h2>
                  <p>Product value</p>
                </div>
                <div className="stat-card">
                  <h3 style={{ color: '#2563eb' }}>Delivery Revenue</h3>
                  <h2 style={{ color: '#2563eb' }}>Rs. {Number(stats.deliverySales).toLocaleString()}</h2>
                  <p>Shipping fees</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <h2>{stats.totalOrders}</h2>
                  <p>Success rate</p>
                </div>
                <div className="stat-card">
                  <h3>Avg. Order</h3>
                  <h2>Rs. {Number(stats.avgOrderValue).toLocaleString()}</h2>
                  <p>Per customer</p>
                </div>
              </div>

              {/* Daily Sales Performance Table */}
              <div className="report-section table-section" style={{ marginTop: '30px' }}>
                <div className="section-header">
                  <h3><TrendingUp size={20} /> Daily Sales Performance</h3>
                </div>
                <div className="table-responsive">
                  <table className="performance-table">
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
                      {stats.dailyPerformance?.length > 0 ? stats.dailyPerformance.map((day, idx) => (
                        <tr key={idx}>
                          <td>{new Date(day.date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: '600' }}>{day.order_count}</td>
                          <td>Rs. {Number(day.product_sales).toLocaleString()}</td>
                          <td>Rs. {Number(day.delivery_sales).toLocaleString()}</td>
                          <td style={{ fontWeight: 'bold', color: '#001a66' }}>Rs. {Number(day.total_sales).toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5">No performance metrics recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Selling Fabrics Section */}
              <div className="report-section table-section" style={{ marginTop: '30px' }}>
                <div className="section-header">
                  <h3><TrendingUp size={20} color="#059669" /> Top Selling Fabrics</h3>
                </div>
                <div className="table-responsive">
                  <table className="performance-table">
                    <thead>
                      <tr>
                        <th>Fabric Name</th>
                        <th>Meters Sold</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topSelling?.length > 0 ? stats.topSelling.map((fabric, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>{fabric.name}</td>
                          <td>{Number(fabric.total_meters).toLocaleString()} m</td>
                          <td style={{ fontWeight: '700', color: '#059669' }}>Rs. {Number(fabric.total_revenue).toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3">No best-sellers found in this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Sales Record Section */}
              <div className="report-section table-section" style={{ marginTop: '30px' }}>
                <div className="section-header">
                  <h3><FileText size={20} /> Detailed Sales Transaction Record</h3>
                </div>
                <div className="table-responsive">
                  <table className="performance-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.detailedOrders?.length > 0 ? stats.detailedOrders.map((order, index) => (
                        <tr key={index}>
                          <td>{new Date(order.order_date).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 'bold', color: '#001a66' }}>#{order.order_id}</td>
                          <td className="month-name">{order.customer_name}</td>
                          <td className="revenue-cell">Rs. {Number(order.total_amount).toLocaleString()}</td>
                          <td>
                            <span style={{ 
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              fontSize: '11px', 
                              fontWeight: '600',
                              background: order.order_status === 'DELIVERED' ? '#dcfce7' : 
                                         order.order_status === 'PENDING' ? '#fef9c3' : '#f1f5f9',
                              color: order.order_status === 'DELIVERED' ? '#166534' : 
                                     order.order_status === 'PENDING' ? '#854d0e' : '#475569'
                            }}>
                              {order.order_status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            No transactions found for this period.
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

              <div className="report-grid" style={{ gridTemplateColumns: '1fr' }}>
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
                        <h3><FileText size={20} /> Recent Stock Arrivals</h3>
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
