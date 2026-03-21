import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, getUser } from '../../../utils/auth.js';
import "./CustomerDashboard.css";

// Import sample images
import fabric1 from "../../../assets/Fabrics/lasecotton.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    cartItems: 0,
    totalSpent: 0
  });

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    fetchDashboardData();

    // Implement Live Update (Polling every 30 seconds)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [fabricsRes, statsRes, ordersRes, notificationsRes] = await Promise.all([
        apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics`),
        apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customer/dashboard-stats`),
        apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders`),
        apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customer/notifications`)
      ]);

      const [fabricsData, statsData, ordersData, notificationsData] = await Promise.all([
        fabricsRes.json(),
        statsRes.json(),
        ordersRes.json(),
        notificationsRes.json()
      ]);

      if (fabricsRes.ok) {
        const fabricsList = fabricsData.fabrics || [];
        // Show unique materials to avoid duplication of variants
        const uniqueFabrics = [...new Map(fabricsList.map(f => [f.name, f])).values()];
        const favoriteFabrics = uniqueFabrics.slice(0, 4).map(fabric => ({
          id: `FAB${fabric.fabric_id.toString().padStart(3, '0')}`,
          fabric_id: fabric.fabric_id,
          name: fabric.name,
          price: `Rs. ${parseFloat(fabric.price_per_meter).toFixed(0)}/m`,
          image: fabric.image_url || fabric1,
          material_type: fabric.material_type,
          stock: fabric.stock_quantity
        }));
        setFavorites(favoriteFabrics);
      }

      if (statsRes.ok) {
        setStats({
          ...statsData,
          notifications: notificationsData.notifications || []
        });
      }

      if (ordersRes.ok) {
        setOrders((ordersData.orders || []).slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-section">
        <div className="welcome-text">
          <h1>Hello, {user?.full_name?.split(' ')[0] || 'Customer'}! 👋</h1>
          <p>Welcome back to Hiran Fabric Textile. Here's what's happening today.</p>
        </div>
        <div className="header-date">
          <span className="date-icon">📅</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-item active">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-trend neutral">All time</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Pending Orders</div>
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-trend warning">In Progress</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Cart Items</div>
          <div className="stat-value">{stats.cartItems}</div>
          <div className="stat-trend success">In Cart</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value small">Rs. {stats.totalSpent.toLocaleString()}</div>
          <div className="stat-trend success">Active Balance</div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="main-left">
          <section className="dashboard-card">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <button className="view-all-link" onClick={() => navigate('/customer/orders')}>View All</button>
            </div>
            <div className="orders-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.order_id} onClick={() => navigate(`/customer/order-details/${order.order_id}`)} style={{ cursor: 'pointer' }}>
                      <td><span className="order-num">#{order.order_id.toString().padStart(3, '0')}</span></td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-pill ${order.order_status.toLowerCase().replace(' ', '-')}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="amount">Rs. {parseFloat(order.total_amount).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="empty-state">No recent orders.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dashboard-card mt-24">
            <div className="card-header">
              <h3>Explore New Fabrics</h3>
              <button className="view-all-link" onClick={() => navigate('/customer/browse')}>Browse Catalog</button>
            </div>
            <div className="fabrics-mini-grid">
              {favorites.map(fabric => (
                <div key={fabric.id} className="mini-fabric-card" onClick={() => navigate(`/customer/fabric/${fabric.fabric_id}`)}>
                  <div className="mini-img-wrapper">
                    <img 
                      src={!fabric.image 
                        ? fabric1 
                        : (typeof fabric.image === 'string' && fabric.image.startsWith('uploads/') 
                            ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${fabric.image}` 
                            : (typeof fabric.image === 'string' && fabric.image.startsWith('http') 
                                ? fabric.image 
                                : (typeof fabric.image === 'string' ? `/src/assets/Fabrics/${fabric.image}` : fabric1)))
                      } 
                      alt={fabric.name} 
                      onError={(e) => { e.target.src = '/src/assets/Fabrics/fabric-collage.jpg'; }} 
                    />
                  </div>
                  <div className="mini-info">
                    <h4>{fabric.name}</h4>
                    <p>{fabric.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="main-right">
          <section className="dashboard-card">
            <div className="card-header">
              <h3>Notifications</h3>
              <button 
                className="refresh-btn" 
                onClick={fetchDashboardData}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                title="Refresh notifications"
              >
                🔄
              </button>
            </div>
            <div className="notifications-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {stats.notifications && stats.notifications.length > 0 ? (
                stats.notifications.map((notif) => {
                  const isRejected = notif.message_content?.startsWith('[REJECTED]');
                  const isPay = notif.confirmation_type?.startsWith('payment_');
                  const message = notif.message_content?.replace('[REJECTED] ', '') || '';
                  const accent = isRejected ? '#ef4444' : isPay ? '#10b981' : '#3b82f6';
                  
                  return (
                    <div key={notif.confirmation_id} className="notification-item" style={{ 
                      padding: '12px', 
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      borderLeft: `4px solid ${accent}`,
                      marginBottom: '8px',
                      background: '#fff'
                    }} onClick={() => navigate(`/customer/order-details/${notif.order_id}`)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>
                          {isRejected ? '⚠️ REJECTED' : notif.confirmation_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                          {new Date(notif.sent_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.4' }}>
                        {message}
                      </p>
                      <div style={{ marginTop: '4px', fontSize: '11px', color: '#2563eb' }}>
                        Order #{notif.order_id} • View Details →
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No new notifications.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
