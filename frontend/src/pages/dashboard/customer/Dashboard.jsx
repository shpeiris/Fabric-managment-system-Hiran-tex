import { customerService } from '../../../services'
import { apiCall } from '../../../utils/auth'
import './Dashboard.css'

const CustomerDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    cartItems: 0,
    totalSpent: 0
  })
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, notifRes] = await Promise.all([
          customerService.getDashboardStats(),
          apiCall('http://localhost:5000/api/customer/notifications')
        ]);
        
        setStats(statsData);
        
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData()
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
        
        <div className="quick-links" style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3>Shortcuts</h3>
          <div className="link-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '1rem' }}>
            <button onClick={() => window.location.hash = '#/catalog'} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}>🛍️ Browse Fabrics</button>
            <button onClick={() => window.location.hash = '#/orders'} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}>📋 View Orders</button>
            <button onClick={() => window.location.hash = '#/payments'} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}>💸 Payment Proofs</button>
            <button onClick={() => window.location.hash = '#/profile'} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer' }}>👤 My Profile</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard