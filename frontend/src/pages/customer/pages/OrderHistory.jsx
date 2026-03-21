import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../../utils/auth.js';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredOrders = orders.filter(order => {
    const orderId = `ORD${order.order_id.toString().padStart(3, '0')}`;
    const matchesSearch = orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      order.order_status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>My Orders History</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>View and track all your past orders.</p>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', background: 'white', cursor: 'pointer', minWidth: '150px' }}
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading orders...</div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Total Amount</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => {
                const statusStyle = getStatusStyle(order.order_status);
                const orderId = `ORD${order.order_id.toString().padStart(3, '0')}`;
                return (
                  <tr key={order.order_id} style={{ borderTop: index > 0 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '16px', color: '#2563eb', fontWeight: '600' }}>{orderId}</td>
                    <td style={{ padding: '16px', color: '#6b7280' }}>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px', color: '#1f2937', fontWeight: '600' }}>Rs. {parseFloat(order.total_amount).toLocaleString()}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                        {order.order_status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => navigate(`/customer/orders/${order.order_id}`)}
                        style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>
                {orders.length === 0 ? 'No orders yet.' : 'No orders match your filter.'}
              </p>
              {orders.length === 0 && (
                <button
                  onClick={() => navigate('/customer/browse')}
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Start Shopping
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
