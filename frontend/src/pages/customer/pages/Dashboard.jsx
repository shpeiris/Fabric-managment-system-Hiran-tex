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
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [fabricsRes, statsRes, ordersRes] = await Promise.all([
        apiCall('http://localhost:5000/api/inventory/fabrics'),
        apiCall('http://localhost:5000/api/customer/dashboard-stats'),
        apiCall('http://localhost:5000/api/orders')
      ]);

      const [fabricsData, statsData, ordersData] = await Promise.all([
        fabricsRes.json(),
        statsRes.json(),
        ordersRes.json()
      ]);

      if (fabricsRes.ok) {
        const fabricsList = fabricsData.fabrics || [];
        const favoriteFabrics = fabricsList.slice(0, 4).map(fabric => ({
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
        setStats(statsData);
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
                    <tr key={order.order_id} onClick={() => navigate(`/customer/orders/${order.order_id}`)}>
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
                    <img src={fabric.image} alt={fabric.name} onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Fabric'; }} />
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



        </div>
      </div>
    </div>
  );
}


