import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../../services'
import { apiCall } from '../../../utils/auth'
import './Dashboard.css'

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    cartItems: 0,
    totalSpent: 0
  })
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true)

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [statsData, notifRes] = await Promise.all([
        customerService.getDashboardStats(),
        apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customer/notifications`)
      ]);
      setStats(statsData);
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, [])

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back!</h1>
        <p className="subtitle">Here's what's happening with your account today.</p>
      </div>

      {/* Real-time Notifications */}
      {notifications.filter(n => !dismissedIds.includes(n.confirmation_id)).slice(0, 3).map(notif => {
        const isRejected = notif.message_content?.startsWith('[REJECTED]');
        const message = notif.message_content?.replace('[REJECTED] ', '') || '';
        const isOrderConf = notif.confirmation_type === 'order_confirmation';
        
        return (
          <div key={notif.confirmation_id} style={{
            display: 'flex', alignItems: 'stretch', borderRadius: '12px', marginBottom: '16px',
            overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            border: `1px solid ${isRejected ? '#fecaca' : isOrderConf ? '#bfdbfe' : '#a7f3d0'}`
          }}>
            <div style={{
              width: '12px', flexShrink: 0,
              background: isRejected ? '#ef4444' : isOrderConf ? '#3b82f6' : '#10b981'
            }} />
            <div style={{
              flex: 1, padding: '16px 20px', background: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#111827', fontWeight: '700' }}>
                    {isRejected ? '⚠️ Action Required' : isOrderConf ? '📦 Order Verified' : '✅ Payment Confirmed'} — Order #{notif.order_id}
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>{message}</p>
                </div>
                <button
                  onClick={() => setDismissedIds(prev => [...prev, notif.confirmation_id])}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px' }}
                >×</button>
              </div>
            </div>
          </div>
        );
      })}

      <div className="dashboard-summary">
        <div className="summary-cards">
          {/* ... existing summary cards ... */}
          <div className="summary-card">
            <h3>Active Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
          <div className="summary-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p className="stat-value">Rs. {stats.totalSpent.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Items in Cart</h3>
            <p className="stat-value">{stats.cartItems}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="recent-activity">
          <h3>Quick Summary</h3>
          <div className="activity-list">
            <p>You have <strong>{stats.pendingOrders}</strong> orders currently in progress.</p>
            {stats.cartItems > 0 && <p>You have <strong>{stats.cartItems}</strong> items waiting in your cart.</p>}
            <p>Your total lifetime spend is <strong>Rs. {stats.totalSpent.toLocaleString()}</strong>.</p>
          </div>
        </div>
        
        {/* Notifications Panel - Embedded in Dashboard */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>🔔 Notifications</h3>
            <span style={{ background: notifications.length > 0 ? '#ef4444' : '#e2e8f0', color: notifications.length > 0 ? 'white' : '#94a3b8', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px' }}>
              {notifications.length}
            </span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '280px', padding: '0.5rem 0' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const isRejected = notif.message_content?.startsWith('[REJECTED]');
                const isPay = notif.confirmation_type?.startsWith('payment_');
                const message = notif.message_content?.replace('[REJECTED] ', '') || '';
                const accent = isRejected ? '#ef4444' : isPay ? '#10b981' : '#3b82f6';
                const icon = isRejected ? '⚠️' : isPay ? '✅' : '📦';
                const sentAt = notif.sent_at ? new Date(notif.sent_at).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '';
                return (
                  <div key={notif.confirmation_id} style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #f8fafc', alignItems: 'flex-start' }}>
                    <div style={{ width: '6px', borderRadius: '3px', flexShrink: 0, alignSelf: 'stretch', background: accent }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b' }}>{icon} Order #{notif.order_id}</span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>{sentAt}</span>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#4b5563', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
