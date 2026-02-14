import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../utils/auth.js';
import "./CustomerDashboard.css";

// Import sample images (Assuming these exist or using fallbacks)
// Since the user had absolute paths to C:\..., I will try to point to the assets folder relatively if possible.
// Or I'll use placeholders if I can't verify them.
import fabric1 from "../../../assets/Fabrics/lasecotton.png";
import fabric2 from "../../../assets/Fabrics/cover-fabric.png";
import fabric3 from "../../../assets/Fabrics/inventory01.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    cartItems: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        const favoriteFabrics = fabricsList.slice(0, 3).map(fabric => ({
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
    <div className="dashboard-container">
      <h1 style={{ marginBottom: '10px' }}>Customer Dashboard</h1>
      <p style={{ color: '#666', fontSize: '15px', marginBottom: '30px' }}>Welcome back! Here's your account overview.</p>

      {/* Summary Cards */}
      <div className="stats-grid">
        <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} icon="⏳" />
        <StatCard title="Cart Items" value={stats.cartItems} icon="🛒" />
        <StatCard title="Total Spent" value={`Rs. ${stats.totalSpent.toLocaleString()}`} icon="💰" />
      </div>

      {/* Quick Actions */}
      <h3 style={{ marginBottom: '20px', opacity: 0.8 }}>Quick Actions</h3>
      <div className="quick-actions-grid">
        <button className="action-btn browse" onClick={() => navigate('/customer/browse')}>
          <span>🧵</span> Browse Fabrics
        </button>
        <button className="action-btn cart" onClick={() => navigate('/customer/cart')}>
          <span>🛒</span> View Cart
        </button>
        <button className="action-btn track" onClick={() => navigate('/customer/orders')}>
          <span>📦</span> Track Orders
        </button>
      </div>

      {/* Recent Orders */}
      <h3 style={{ marginBottom: '20px', opacity: 0.8 }}>Recent Orders</h3>
      <div className="orders-section">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map((order) => (
              <tr key={order.order_id}>
                <td style={{ color: '#001a66', fontWeight: 'bold' }}>#{order.order_id.toString().padStart(3, '0')}</td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>{order.item_count} items</td>
                <td style={{ fontWeight: '600' }}>Rs. {parseFloat(order.total_amount).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${order.order_status.toLowerCase().replace(' ', '-')}`}>
                    {order.order_status}
                  </span>
                </td>
                <td>
                  <button
                    style={{
                      background: 'none',
                      border: '1px solid #001a66',
                      color: '#001a66',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    onClick={() => navigate(`/customer/orders/${order.order_id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No recent orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Favorite Fabrics */}
      <h3 style={{ marginBottom: '20px', opacity: 0.8 }}>Recent Fabrics</h3>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading fabrics...
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(fabric => (
            <div key={fabric.id} className="fav-card">
              <img
                src={fabric.image}
                alt={fabric.name}
                className="fav-image"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x160?text=No+Image'; }}
              />
              <div className="fav-details">
                <h4 className="fav-name">{fabric.name}</h4>
                <p className="fav-price">{fabric.price}</p>
                {fabric.material_type && (
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                    {fabric.material_type}
                  </p>
                )}
                <button
                  className="add-cart-btn"
                  onClick={() => navigate(`/customer/fabric/${fabric.fabric_id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h4>{title}</h4>
        <h2>{value}</h2>
      </div>
      <div className="stat-icon">
        {icon}
      </div>
    </div>
  );
}
