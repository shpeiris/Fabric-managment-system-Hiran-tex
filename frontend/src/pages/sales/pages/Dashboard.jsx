import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import "./SalesDashboard.css";

// Professional SVG Components
const IconWrapper = ({ children, color = "currentColor", size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const DollarSign = (props) => (
  <IconWrapper {...props}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></IconWrapper>
);

const TrendingUp = (props) => (
  <IconWrapper {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></IconWrapper>
);

const Users = (props) => (
  <IconWrapper {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></IconWrapper>
);

const Package = (props) => (
  <IconWrapper {...props}><line x1="16.5" y1="9.4" x2="16.5" y2="4.01"></line><path d="M20.94 11l-9.11 5.23-9.11-5.23L12.72 5.77 20.94 11z"></path><path d="M2.06 14.5l9.11 5.23 9.11-5.23"></path><line x1="2.06" y1="11" x2="2.06" y2="14.5"></line><line x1="21.88" y1="11" x2="21.88" y2="14.5"></line><line x1="12" y1="21" x2="12" y2="15"></line></IconWrapper>
);

const CheckCircle = (props) => (
  <IconWrapper {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></IconWrapper>
);

const CreditCard = (props) => (
  <IconWrapper {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></IconWrapper>
);

const Zap = (props) => (
  <IconWrapper {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></IconWrapper>
);

const Clipboard = (props) => (
  <IconWrapper {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></IconWrapper>
);

const Mail = (props) => (
  <IconWrapper {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2-2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></IconWrapper>
);

const XCircle = (props) => (
  <IconWrapper {...props}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></IconWrapper>
);

const Truck = (props) => (
  <IconWrapper {...props}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></IconWrapper>
);

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

  const handleVerifyOrder = async (orderId, action) => {
    try {
      setActionLoading(true);
      SalesLogger.dashboard.orderAction({ action: `verify_${action}`, orderId });
      
      const response = await apiCall(`http://localhost:5000/api/sales/verify-order/${orderId}`, {
        method: 'POST',
        body: JSON.stringify({ 
          action, 
          verifiedBy: 'Salesperson' // In a real app, this would be the logged-in user's name
        })
      });

      if (response.ok) {
        SalesLogger.dashboard.orderAction({ success: true, orderId, action });
        await fetchDashboardData();
        setShowVerificationModal(false);
        // Automatically open notification modal for the verified order
        setShowConfirmationModal(true);
      } else {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} order`);
      }
    } catch (err) {
      console.error(`Error ${action}ing order:`, err);
      SalesLogger.dashboard.orderActionError(err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId, methodOrStatus) => {
    try {
      setActionLoading(true);
      SalesLogger.dashboard.paymentAction({ action: 'confirm_payment', paymentId });
      
      const response = await apiCall('http://localhost:5000/api/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: paymentId,
          status: methodOrStatus === 'FAILED' ? 'FAILED' : 'COMPLETED',
          confirmedBy: 'Salesperson',
          method: methodOrStatus === 'FAILED' ? 'N/A' : methodOrStatus
        })
      });

      if (response.ok) {
        SalesLogger.dashboard.paymentAction({ success: true, paymentId });
        await fetchDashboardData();
        setShowPaymentModal(false);
        // Automatically open notification modal for the settled order
        setShowConfirmationModal(true);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process payment');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      SalesLogger.dashboard.paymentActionError(err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendConfirmation = async (orderId, type) => {
    try {
      setActionLoading(true);
      SalesLogger.dashboard.notificationAction({ type, orderId });
      
      const response = await apiCall('http://localhost:5000/api/sales/send-confirmation', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          type,
          sentBy: 'Salesperson'
        })
      });

      if (response.ok) {
        SalesLogger.dashboard.notificationAction({ success: true, orderId, type });
        alert(`${type.replace('_', ' ')} sent successfully!`);
        setShowConfirmationModal(false);
        setSelectedOrder(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send confirmation');
      }
    } catch (err) {
      console.error('Error sending confirmation:', err);
      SalesLogger.dashboard.notificationActionError(err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="sales-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Sales Dashboard</h1>
        <button 
          onClick={fetchDashboardData} 
          disabled={loading}
          className="action-btn orders-btn" 
          style={{ padding: '8px 16px', fontSize: '12px', border: 'none', background: '#001a66', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
        >
          <Zap size={14} color="white" />
          {loading ? 'Syncing...' : 'Sync Dashboard'}
        </button>
      </div>
      <p className="subtitle">Track your sales performance and manage orders</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-container">
            <DollarSign size={32} color="#001a66" />
          </div>
          <div className="stat-info">
            <h4>Total Revenue</h4>
            <h2>Rs. {Number(stats.totalSales).toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon-container">
            <TrendingUp size={32} color="#001a66" />
          </div>
          <div className="stat-info">
            <h4>Monthly Growth</h4>
            <h2>Rs. {Number(stats.monthlySales).toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <Users size={32} color="#001a66" />
          </div>
          <div className="stat-info">
            <h4>Active Customers</h4>
            <h2>{stats.totalCustomers}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <Package size={32} color="#001a66" />
          </div>
          <div className="stat-info">
            <h4>Orders to Fulfill</h4>
            <h2>{stats.pendingOrders}</h2>
          </div>
        </div>

        <div className="stat-card verification" onClick={() => setShowVerificationModal(true)}>
          <div className="stat-icon-container">
            <CheckCircle size={32} color="#856404" />
          </div>
          <div className="stat-info">
            <h4>Security Checks</h4>
            <h2>{stats.verificationRequired}</h2>
            <p className="stat-subtitle">Verify pending orders</p>
          </div>
        </div>

        <div className="stat-card payment" onClick={() => setShowPaymentModal(true)}>
          <div className="stat-icon-container">
            <CreditCard size={32} color="#155724" />
          </div>
          <div className="stat-info">
            <h4>Payment Queue</h4>
            <h2>{stats.pendingPayments}</h2>
            <p className="stat-subtitle">Process incoming payments</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="section-header">
          <Zap size={24} color="#001a66" />
          <h3>Management Toolbar</h3>
        </div>
        <div className="action-buttons">
          <button 
            className="action-btn verify-btn"
            onClick={() => setShowVerificationModal(true)}
            disabled={stats.verificationRequired === 0}
          >
            <CheckCircle size={18} />
            <span>Review Verifications ({stats.verificationRequired})</span>
          </button>
          
          <button 
            className="action-btn payment-btn"
            onClick={() => setShowPaymentModal(true)}
            disabled={stats.pendingPayments === 0}
          >
            <CreditCard size={18} />
            <span>Release Payments ({stats.pendingPayments})</span>
          </button>
          
          <button 
            className="action-btn confirm-btn"
            onClick={() => setShowConfirmationModal(true)}
          >
            <Mail size={18} />
            <span>Notify Customers</span>
          </button>
          
          <button 
            className="action-btn orders-btn"
            onClick={() => navigate('/sales/orders')}
          >
            <Clipboard size={18} />
            <span>Order Database</span>
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="section">
        <div className="section-header">
          <Clipboard size={24} color="#001a66" />
          <h3>Transaction History</h3>
        </div>
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
                            title="Verify Order Security"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {order.payment_status === 'PENDING' && (
                          <button 
                            className="mini-btn payment" 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentModal(true);
                            }}
                            title="Process Payment Transaction"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        {order.bank_slip_url && (
                          <a 
                            href={`http://localhost:5000/${order.bank_slip_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mini-btn slip"
                            title="View Bank Slip Proof"
                          >
                            <Package size={14} />
                          </a>
                        )}
                        <button 
                          className="mini-btn confirm" 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowConfirmationModal(true);
                          }}
                          title="Contact Customer"
                        >
                          <Mail size={14} />
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
              <Clipboard size={20} color="#001a66" />
              <h3>Security Verification</h3>
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

                  {selectedOrder.bank_slip_url && (
                    <div className="slip-preview">
                      <h5>Bank Slip Proof:</h5>
                      <div className="slip-image-container">
                        <img 
                          src={`http://localhost:5000/${selectedOrder.bank_slip_url}`} 
                          alt="Bank Slip" 
                          className="bank-slip-img"
                          onClick={() => window.open(`http://localhost:5000/${selectedOrder.bank_slip_url}`, '_blank')}
                        />
                      </div>
                      <p className="slip-hint">Click image to enlarge</p>
                      <button 
                        className="btn" 
                        onClick={() => window.print()}
                        style={{ marginTop: '10px', background: '#f3f4f6', color: '#1f2937', border: '1px solid #d1d5db', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Clipboard size={16} /> Print Order / Invoice
                      </button>
                    </div>
                  )}
                  
                  <div className="verification-actions">
                    <button 
                      className="btn verify-approve"
                      onClick={() => handleVerifyOrder(selectedOrder.order_id, 'approve')}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={16} />
                      Approve Order
                    </button>
                    <button 
                      className="btn verify-reject"
                      onClick={() => handleVerifyOrder(selectedOrder.order_id, 'reject')}
                      disabled={actionLoading}
                    >
                      <XCircle size={16} />
                      Reject Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pending-verifications">
                  <h4>Orders Requiring Verification ({pendingVerifications.length})</h4>
                  {pendingVerifications.map(order => (
                    <div 
                      key={order.order_id} 
                      className="verification-item clickable"
                      onClick={() => setSelectedOrder(order)}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      <div className="order-info">
                        <strong>Order #{order.order_id}</strong>
                        <span>{order.customer_name} - Rs. {Number(order.total_amount).toLocaleString()}</span>
                        {order.bank_slip_url && <small style={{ color: '#001a66' }}>📎 Has Payment Proof</small>}
                      </div>
                      <div className="verification-buttons">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            handleVerifyOrder(order.order_id, 'approve');
                          }}
                          disabled={actionLoading}
                        >
                          <CheckCircle size={14} /> Approve
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
        <div className="modal-overlay" onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <CreditCard size={20} color="#001a66" />
              <h3>Payment Settlement</h3>
              <button className="close-btn" onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); }}>×</button>
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

                  {selectedOrder.bank_slip_url && (
                    <div className="slip-preview">
                      <h5>Bank Slip Proof:</h5>
                      <div className="slip-image-container">
                        <img 
                          src={`http://localhost:5000/${selectedOrder.bank_slip_url}`} 
                          alt="Bank Slip" 
                          className="bank-slip-img"
                          onClick={() => window.open(`http://localhost:5000/${selectedOrder.bank_slip_url}`, '_blank')}
                        />
                      </div>
                      <p className="slip-hint">Click image to enlarge</p>
                    </div>
                  )}
                  
                  <div className="payment-actions">
                    <button 
                      className="btn payment-confirm"
                      onClick={() => handleConfirmPayment(selectedOrder.payment_id, selectedOrder.payment_method)}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={16} /> Confirm Receipt
                    </button>
                    <button 
                      className="btn payment-reject"
                      onClick={() => handleConfirmPayment(selectedOrder.payment_id, 'FAILED')}
                      disabled={actionLoading}
                    >
                      <XCircle size={16} /> Flag Issue
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pending-payments">
                  <h4>Payments Requiring Processing ({pendingPayments.length})</h4>
                  {pendingPayments.map(order => (
                    <div 
                      key={order.order_id} 
                      className="payment-item clickable"
                      onClick={() => setSelectedOrder(order)}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      <div className="order-info">
                        <strong>Order #{order.order_id}</strong>
                        <span>{order.customer_name} - Rs. {Number(order.total_amount).toLocaleString()}</span>
                        <small>Method: {order.payment_method}</small>
                      </div>
                      <div className="payment-buttons">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            handleConfirmPayment(order.payment_id, order.payment_method);
                          }}
                          disabled={actionLoading}
                        >
                          <CheckCircle size={14} /> Confirm
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
              <Mail size={20} color="#001a66" />
              <h3>Client Communication</h3>
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
                      <Clipboard size={16} /> Order Status Update
                    </button>
                    <button 
                      className="btn confirmation-type"
                      onClick={() => handleSendConfirmation(selectedOrder.order_id, 'payment_confirmation')}
                      disabled={actionLoading}
                    >
                      <CreditCard size={16} /> Payment Receipt
                    </button>
                    <button 
                      className="btn confirmation-type"
                      onClick={() => handleSendConfirmation(selectedOrder.order_id, 'delivery_update')}
                      disabled={actionLoading}
                    >
                      <Truck size={16} /> Shipping Logistics
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
                      <Clipboard size={16} /> Batch Order Notifications
                    </button>
                    <button 
                      className="btn bulk-confirmation"
                      onClick={() => handleSendConfirmation('all', 'payment_confirmation')}
                      disabled={actionLoading}
                    >
                      <CreditCard size={16} /> Batch Payment Acknowledgements
                    </button>
                    <button 
                      className="btn bulk-confirmation"
                      onClick={() => handleSendConfirmation('all', 'delivery_update')}
                      disabled={actionLoading}
                    >
                      <Truck size={16} /> Batch Dispatch Alerts
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