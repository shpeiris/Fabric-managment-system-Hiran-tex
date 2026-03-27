import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from "../../../utils/auth.js";
import { Bell, CheckCircle, XCircle, Info, Package, RefreshCw } from 'lucide-react';
import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
    
    // Implement Live Update (Polling every 30 seconds)
    const interval = setInterval(() => {
      fetchNotifications(false); // Silent update
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customer/notifications`);
      const data = await res.json();
      
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payment_confirmation': return <CheckCircle size={18} color="#059669" />;
      case 'payment_rejection': return <XCircle size={18} color="#dc2626" />;
      case 'order_confirmation': return <Package size={18} color="#2563eb" />;
      case 'delivery_update': return <Info size={18} color="#7c3aed" />;
      default: return <Bell size={18} color="#6b7280" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'orders') return notif.confirmation_type === 'order_confirmation' || notif.confirmation_type === 'delivery_update';
    if (filter === 'payments') return notif.confirmation_type.startsWith('payment_');
    return true;
  });

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="title-section">
          <h1>Notifications</h1>
          <p>Stay updated on your orders and payments</p>
        </div>
        <button className="refresh-btn" onClick={() => fetchNotifications()} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="notifications-filter-bar">
        <div className="filter-chips">
          <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-chip ${filter === 'orders' ? 'active' : ''}`} onClick={() => setFilter('orders')}>Orders</button>
          <button className={`filter-chip ${filter === 'payments' ? 'active' : ''}`} onClick={() => setFilter('payments')}>Payments</button>
        </div>
        <div className="notif-count">
          {filteredNotifications.length} Notifications
        </div>
      </div>

      <div className="notifications-list">
        {loading && notifications.length === 0 ? (
          <div className="empty-state">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} color="#cbd5e1" />
            <p>No notifications match your filter.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.confirmation_id} 
              className={`notification-card ${notif.confirmation_type}`}
              onClick={() => navigate(`/customer/orders/${notif.order_id}`)}
            >
              <div className="notif-icon-wrapper">
                {getIcon(notif.confirmation_type)}
              </div>
              <div className="notif-content">
                <div className="notif-header">
                  <span className="notif-type">{notif.confirmation_type.replace('_', ' ').toUpperCase()}</span>
                  <span className="notif-time">{new Date(notif.sent_at).toLocaleDateString()}</span>
                </div>
                <p className="notif-msg">{notif.message_content}</p>
                <div className="notif-footer">
                  <span className="order-tag">Order #{notif.order_id}</span>
                  <span className={`status-tag ${notif.order_status.toLowerCase()}`}>{notif.order_status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
