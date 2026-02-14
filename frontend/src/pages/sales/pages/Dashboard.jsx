import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import "./SalesDashboard.css";

export default function SalesDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    monthlySales: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    pendingPayments: 0,
    verificationRequired: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    SalesLogger.dashboard.pageLoad({ timestamp: new Date().toISOString() });
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      SalesLogger.dashboard.dataFetch({ action: 'fetch_dashboard_data' });
      
      // Fetch comprehensive dashboard data
      const [dashboardRes, verificationsRes, paymentsRes] = await Promise.all([
        apiCall('http://localhost:5000/api/sales/dashboard'),
        apiCall('http://localhost:5000/api/sales/pending-verifications'),
        apiCall('http://localhost:5000/api/sales/pending-payments')
      ]);

      const dashboardData = await dashboardRes.json();
      const verificationsData = await verificationsRes.json();
      const paymentsData = await paymentsRes.json();

      if (dashboardRes.ok) {
        setStats({
          ...dashboardData.stats,
          verificationRequired: verificationsData.count || 0,
          pendingPayments: paymentsData.count || 0
        });
        setRecentOrders(dashboardData.recentOrders || []);
        setPendingVerifications(verificationsData.orders || []);
        setPendingPayments(paymentsData.orders || []);
        
        SalesLogger.dashboard.dataFetch({ 
          success: true, 
          ordersCount: dashboardData.recentOrders?.length || 0,
          totalSales: dashboardData.stats?.totalSales || 0,
          verificationsCount: verificationsData.count || 0,
          paymentsCount: paymentsData.count || 0
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      SalesLogger.dashboard.dataFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-dashboard">
      <h1>Sales Dashboard</h1>
      <p className="subtitle">Track your sales performance and manage orders</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h4>Total Sales</h4>
            <h2>Rs. {Number(stats.totalSales).toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h4>Monthly Sales</h4>
            <h2>Rs. {Number(stats.monthlySales).toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h4>Total Customers</h4>
            <h2>{stats.totalCustomers}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h4>Pending Orders</h4>
            <h2>{stats.pendingOrders}</h2>
          </div>
        </div>

        <div className="stat-card verification" onClick={() => setShowVerificationModal(true)}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h4>Need Verification</h4>
            <h2>{stats.verificationRequired}</h2>
            <p className="stat-subtitle">Click to review</p>
          </div>
        </div>

        <div className="stat-card payment" onClick={() => setShowPaymentModal(true)}>
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h4>Pending Payments</h4>
            <h2>{stats.pendingPayments}</h2>
            <p className="stat-subtitle">Click to process</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>🚀 Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn verify-btn"
            onClick={() => setShowVerificationModal(true)}
            disabled={stats.verificationRequired === 0}
          >
            <span className="btn-icon">✅</span>
            Verify Orders ({stats.verificationRequired})
          </button>
          
          <button 
            className="action-btn payment-btn"
            onClick={() => setShowPaymentModal(true)}
            disabled={stats.pendingPayments === 0}
          >
            <span className="btn-icon">💳</span>
            Process Payments ({stats.pendingPayments})
          </button>
          
          <button 
            className="action-btn confirm-btn"
            onClick={() => setShowConfirmationModal(true)}
          >
            <span className="btn-icon">📧</span>
            Send Confirmations
          </button>
          
          <button 
            className="action-btn orders-btn"
            onClick={() => navigate('/sales/orders')}
          >
            <span className="btn-icon">📋</span>
            All Orders
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="section">
        <h3>📋 Recent Orders</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order.order_id}>
                    <td>#{order.order_id}</td>
                    <td>{order.customer_name}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>Rs. {Number(order.total_amount).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${order.order_status.toLowerCase()}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td>
                      <div className="payment-info">
                        <span className={`payment-status ${order.payment_status?.toLowerCase()}`}>
                          {order.payment_status || 'Pending'}
                        </span>
                        <small>{order.payment_method || 'Not set'}</small>
                      </div>
                    </td>
                    <td>{order.delivery_type || 'Standard'}</td>
                    <td>
                      <div className="action-buttons-mini">
                        {order.order_status === 'PENDING' && (
                          <button 
                            className="mini-btn verify" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowVerificationModal(true);
                            }}
                            title="Verify Order"
                          >
                            ✅
                          </button>
                        )}
                        {order.payment_status === 'PENDING' && (
                          <button 
                            className="mini-btn payment" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentModal(true);
                            }}
                            title="Process Payment"
                          >
                            💳
                          </button>
                        )}
                        <button 
                          className="mini-btn confirm" 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowConfirmationModal(true);
                          }}
                          title="Send Confirmation"
                        >
                          📧
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Verification Modal */}
      {showVerificationModal && (
        <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Order Verification</h3>
              <button className="close-btn" onClick={() => setShowVerificationModal(false)}>×</button>
            </div>
            <div className="modal-content">
              {selectedOrder ? (
                <div className="order-verification">
                  <div className="order-summary">
                    <h4>Order #{selectedOrder.order_id}</h4>
                    <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Amount:</strong> Rs. {Number(selectedOrder.total_amount).toLocaleString()}</p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="verification-checklist">
                    <h5>Verification Checklist:</h5>
                    <ul>
                      <li>✓ Customer details verified</li>
                      <li>✓ Fabric availability confirmed</li>
                      <li>✓ Delivery address validated</li>
                      <li>✓ Order amount correct</li>
                    </ul>
                  </div>
                  
                  <div className="verification-actions">
                    <button 
                      className="btn verify-approve"
                      onClick={() => handleVerifyOrder(selectedOrder.order_id, 'approve')}
                      disabled={actionLoading}
                    >
                      ✅ Approve Order
                    </button>
                    <button 
                      className="btn verify-reject"
                      onClick={() => handleVerifyOrder(selectedOrder.order_id, 'reject')}
                      disabled={actionLoading}
                    >
                      ❌ Reject Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pending-verifications">
                  <h4>Orders Requiring Verification ({pendingVerifications.length})</h4>
                  {pendingVerifications.map(order => (
                    <div key={order.order_id} className="verification-item">
                      <div className="order-info">
                        <strong>Order #{order.order_id}</strong>
                        <span>{order.customer_name} - Rs. {Number(order.total_amount).toLocaleString()}</span>
                      </div>
                      <div className="verification-buttons">
                        <button 
                          onClick={() => handleVerifyOrder(order.order_id, 'approve')}
                          disabled={actionLoading}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          onClick={() => handleVerifyOrder(order.order_id, 'reject')}
                          disabled={actionLoading}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💳 Payment Processing</h3>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="modal-content">
              {selectedOrder ? (
                <div className="payment-processing">
                  <div className="order-summary">
                    <h4>Order #{selectedOrder.order_id}</h4>
                    <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Amount:</strong> Rs. {Number(selectedOrder.total_amount).toLocaleString()}</p>
                    <p><strong>Method:</strong> {selectedOrder.payment_method || 'Not specified'}</p>
                  </div>
                  
                  <div className="payment-actions">
                    <button 
                      className="btn payment-confirm"
                      onClick={() => handleConfirmPayment(selectedOrder.payment_id, selectedOrder.payment_method)}
                      disabled={actionLoading}
                    >
                      ✅ Confirm Payment
                    </button>
                    <button 
                      className="btn payment-reject"
                      onClick={() => handleConfirmPayment(selectedOrder.payment_id, 'FAILED')}
                      disabled={actionLoading}
                    >
                      ❌ Reject Payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pending-payments">
                  <h4>Payments Requiring Processing ({pendingPayments.length})</h4>
                  {pendingPayments.map(order => (
                    <div key={order.order_id} className="payment-item">
                      <div className="order-info">
                        <strong>Order #{order.order_id}</strong>
                        <span>{order.customer_name} - Rs. {Number(order.total_amount).toLocaleString()}</span>
                        <small>Method: {order.payment_method}</small>
                      </div>
                      <div className="payment-buttons">
                        <button 
                          onClick={() => handleConfirmPayment(order.payment_id, order.payment_method)}
                          disabled={actionLoading}
                        >
                          ✅ Confirm
                        </button>
                        <button 
                          onClick={() => handleConfirmPayment(order.payment_id, 'FAILED')}
                          disabled={actionLoading}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Confirmation Modal */}
      {showConfirmationModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmationModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📧 Send Customer Confirmation</h3>
              <button className="close-btn" onClick={() => setShowConfirmationModal(false)}>×</button>
            </div>
            <div className="modal-content">
              {selectedOrder ? (
                <div className="confirmation-sending">
                  <div className="order-summary">
                    <h4>Order #{selectedOrder.order_id}</h4>
                    <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.phone_number || 'Not provided'}</p>
                    <p><strong>Email:</strong> {selectedOrder.email || 'Not provided'}</p>
                  </div>
                  
                  <div className="confirmation-types">
                    <h5>Select Confirmation Type:</h5>
                    <button 
                      className="btn confirmation-type"
                      onClick={() => handleSendConfirmation(selectedOrder.order_id, 'order_confirmation')}
                      disabled={actionLoading}
                    >
                      📋 Order Confirmation
                    </button>
                    <button 
                      className="btn confirmation-type"
                      onClick={() => handleSendConfirmation(selectedOrder.order_id, 'payment_confirmation')}
                      disabled={actionLoading}
                    >
                      💳 Payment Confirmation
                    </button>
                    <button 
                      className="btn confirmation-type"
                      onClick={() => handleSendConfirmation(selectedOrder.order_id, 'delivery_update')}
                      disabled={actionLoading}
                    >
                      🚚 Delivery Update
                    </button>
                  </div>
                </div>
              ) : (
                <div className="confirmation-options">
                  <h4>Send Bulk Confirmations</h4>
                  <p>Select the type of confirmation to send to all eligible customers:</p>
                  
                  <div className="bulk-confirmation-actions">
                    <button 
                      className="btn bulk-confirmation"
                      onClick={() => handleSendConfirmation('all', 'order_confirmation')}
                      disabled={actionLoading}
                    >
                      📋 Send Order Confirmations
                    </button>
                    <button 
                      className="btn bulk-confirmation"
                      onClick={() => handleSendConfirmation('all', 'payment_confirmation')}
                      disabled={actionLoading}
                    >
                      💳 Send Payment Confirmations
                    </button>
                    <button 
                      className="btn bulk-confirmation"
                      onClick={() => handleSendConfirmation('all', 'delivery_update')}
                      disabled={actionLoading}
                    >
                      🚚 Send Delivery Updates
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}