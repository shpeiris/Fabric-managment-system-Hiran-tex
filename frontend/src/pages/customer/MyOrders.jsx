import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../utils/auth.js';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

export default function Orders() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await apiCall(`${API}/api/orders`);
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = selectedTab === 'all'
    ? orders
    : orders.filter(order => order.order_status.toLowerCase() === selectedTab);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return { bg: '#d1fae5', color: '#065f46' };
      case 'PROCESSING': return { bg: '#fef3c7', color: '#92400e' };
      case 'CANCELLED': return { bg: '#fee2e2', color: '#991b1b' };
      case 'PENDING': return { bg: '#e0f2fe', color: '#075985' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>My Orders</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Track and manage your fabric orders.</p>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb' }}>
        {['all', 'pending', 'processing', 'delivered', 'cancelled'].map(tab => (
          <button key={tab} onClick={() => setSelectedTab(tab)}
            style={{ padding: '12px 20px', border: 'none', background: 'transparent', color: selectedTab === tab ? '#2563eb' : '#6b7280', borderBottom: selectedTab === tab ? '2px solid #2563eb' : '2px solid transparent', fontSize: '14px', cursor: 'pointer', fontWeight: selectedTab === tab ? '600' : '400', textTransform: 'capitalize', marginBottom: '-1px' }}
          >
            {tab} {tab !== 'all' && orders.filter(o => o.order_status.toLowerCase() === tab).length > 0 &&
              <span style={{ background: '#e0f2fe', color: '#075985', borderRadius: '10px', padding: '2px 6px', fontSize: '11px', marginLeft: '4px' }}>
                {orders.filter(o => o.order_status.toLowerCase() === tab).length}
              </span>
            }
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading orders...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredOrders.map(order => {
            const statusStyle = getStatusStyle(order.order_status);
            const orderId = `ORD${order.order_id.toString().padStart(3, '0')}`;
            return (
              <div key={order.order_id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Order {orderId}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                      Placed on {new Date(order.order_date).toLocaleDateString()}
                      {order.delivery_type && ` • ${order.delivery_type}`}
                    </p>
                  </div>
                  <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '500' }}>
                    {order.order_status}
                  </span>
                </div>

                {order.delivery_address && (
                  <div style={{ background: '#f9fafb', padding: '10px 12px', borderRadius: '6px', marginBottom: '15px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Delivery Address</p>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{order.delivery_address}</p>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '3px' }}>Total Amount</p>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>Rs. {parseFloat(order.total_amount).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => navigate(`/customer/orders/${order.order_id}`)}
                      style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📦</div>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>
                {orders.length === 0 ? 'No orders yet. Start shopping!' : `No ${selectedTab} orders.`}
              </p>
              {orders.length === 0 && (
                <button
                  onClick={() => navigate('/customer/browse')}
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Browse Fabrics
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
