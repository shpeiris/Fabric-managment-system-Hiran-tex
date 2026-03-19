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
    pendingPayments: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    SalesLogger.dashboard.pageLoad({ timestamp: new Date().toISOString() });
    fetchDashboardData();

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      SalesLogger.dashboard.dataFetch({ action: 'fetch_dashboard_data' });
      
      // Fetch comprehensive dashboard data
      const [dashboardRes, paymentsRes] = await Promise.all([
        apiCall('http://localhost:5000/api/sales/dashboard'),
        apiCall('http://localhost:5000/api/sales/pending-payments')
      ]);

      const dashboardData = await dashboardRes.json();
      const paymentsData = await paymentsRes.json();

      if (dashboardRes.ok) {
        setStats({
          ...dashboardData.stats,
          pendingPayments: paymentsData.count || 0
        });
        setRecentOrders(dashboardData.recentOrders || []);
        setPendingPayments(paymentsData.orders || []);
        
        return {
          stats: dashboardData.stats,
          recentOrders: dashboardData.recentOrders || [],
          pendingPayments: paymentsData.orders || []
        };
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      SalesLogger.dashboard.dataFetchError(err);
    } finally {
      setLoading(false);
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
        const data = await fetchDashboardData();
        
        // Re-find the order in the updated lists to get the items
        if (data) {
          // Since it's a payment, it might have moved to recentOrders or still be in pendingPayments
          const updatedOrder = data.recentOrders.find(o => o.payment_id === Number(paymentId)) ||
                               data.pendingPayments.find(o => o.payment_id === Number(paymentId));
          if (updatedOrder) setSelectedOrder(updatedOrder);
        }

        // Instead of closing, show invoice view
        setShowInvoiceView(true);
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
        setShowInvoiceView(false); // Close invoice view if it was open
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

  const renderInvoice = (order) => {
    if (!order) return null;
    
    const items = order.items || [];
    const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);
    
    return (
      <div className="invoice-container" id="printable-invoice" style={{ padding: '20px', background: 'white', color: '#1a1a1a' }}>
        <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #001a66', paddingBottom: '15px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: '#001a66', margin: 0 }}>Hiran Fabric Textile</h2>
            <p style={{ fontSize: '12px', margin: '4px 0', color: '#666' }}>Official Order Invoice</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 'bold', margin: 0 }}>Order #{order.order_id}</p>
            <p style={{ fontSize: '12px', margin: '4px 0', color: '#666' }}>Date: {new Date(order.order_date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="invoice-info" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div className="customer-details">
            <h5 style={{ margin: '0 0 8px 0', color: '#333', textTransform: 'uppercase', fontSize: '11px' }}>Bill To:</h5>
            <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>{order.customer_name}</p>
            <p style={{ fontSize: '13px', margin: '2px 0' }}>{order.customer_email || 'No email provided'}</p>
          </div>
          <div className="order-status-info" style={{ textAlign: 'right' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#333', textTransform: 'uppercase', fontSize: '11px' }}>Status:</h5>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: 'bold',
              background: '#001a66',
              color: 'white'
            }}>
              {order.order_status}
            </span>
          </div>
        </div>

        <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Fabric Name</th>
              <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>Unit Price</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f1f1' }}>
                <td style={{ padding: '12px', fontSize: '13px' }}>{item.fabric_name}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>{item.quantity} m</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>Rs. {Number(item.unit_price).toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '500' }}>Rs. {Number(item.total_price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-total" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #001a66' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Total Amount</span>
              <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#001a66' }}>Rs. {Number(order.total_amount).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#888', textAlign: 'right', marginTop: '4px' }}>
              Inc. all applicable taxes
            </div>
          </div>
        </div>

        <div className="invoice-footer" style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '15px', textAlign: 'center', fontSize: '11px', color: '#999' }}>
          <p>Thank you for choosing Hiran Fabric Textile.</p>
          <p>This is a computer-generated invoice and doesn't require a signature.</p>
        </div>
      </div>
    );
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

      {/* Notifications Alert Section */}
      {pendingPayments.filter(p => p.payment_status === 'PENDING').length > 0 && (
        <div style={{
          background: '#e0f2fe',
          borderLeft: '5px solid #0284c7',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ fontSize: '24px' }}>💳</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#0369a1', fontSize: '15px' }}>New Verification Requests</h4>
            <p style={{ margin: '5px 0 0', color: '#0c4a6e', fontSize: '13px', fontWeight: '500' }}>
              There are {pendingPayments.filter(p => p.payment_status === 'PENDING').length} payments requiring verification. 
              {pendingPayments.filter(p => p.bank_slip_url && p.payment_status === 'PENDING').length > 0 && " Some include uploaded bank slips."}
            </p>
          </div>
          <button 
            onClick={() => navigate('/sales/payments')}
            style={{
              background: '#0284c7',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Review Payments →
          </button>
        </div>
      )}

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

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); setShowInvoiceView(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <CreditCard size={20} color="#001a66" />
              <h3>{showInvoiceView ? 'Official Invoice' : 'Payment Settlement'}</h3>
              <button className="close-btn" onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); setShowInvoiceView(false); }}>×</button>
            </div>
            <div className="modal-content">
              {showInvoiceView ? (
                <div className="invoice-preview-mode">
                  {renderInvoice(selectedOrder)}
                  <div className="invoice-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
                    <button className="btn print-btn" onClick={() => window.print()} style={{ background: '#001a66', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                      <Clipboard size={16} /> Print Official Invoice
                    </button>
                    <button className="btn notify-btn" onClick={() => { setShowPaymentModal(false); setShowConfirmationModal(true); setShowInvoiceView(false); }} style={{ background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                      Next: Send Confirmation <Mail size={16} />
                    </button>
                  </div>
                </div>
              ) : selectedOrder ? (
                <div className="payment-processing">
                  <div className="order-summary">
                    <h4>Order #{selectedOrder.order_id}</h4>
                    <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Phone:</strong> {selectedOrder.phone_number || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedOrder.delivery_address || 'N/A'}</p>
                    <p><strong>Amount:</strong> Rs. {Number(selectedOrder.total_amount).toLocaleString()}</p>
                    <p><strong>Method:</strong> {selectedOrder.payment_method || 'Not specified'}</p>
                  </div>

                  <div className="order-items-preview" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px', marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '10px' }}>Order Items:</h5>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <tbody>
                        {(selectedOrder.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '4px 0' }}>{item.fabric_name}</td>
                            <td style={{ padding: '4px 0', textAlign: 'center' }}>{item.quantity}m</td>
                            <td style={{ padding: '4px 0', textAlign: 'right' }}>Rs. {Number(item.total_price).toLocaleString()}</td>
                          </tr>
                        ))}
                        {selectedOrder.delivery_fee > 0 && (
                          <tr style={{ borderTop: '1px solid #eee' }}>
                            <td colSpan="2" style={{ padding: '8px 0', fontWeight: '600', color: '#001a66' }}>Delivery Fee</td>
                            <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#001a66' }}>Rs. {Number(selectedOrder.delivery_fee).toLocaleString()}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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