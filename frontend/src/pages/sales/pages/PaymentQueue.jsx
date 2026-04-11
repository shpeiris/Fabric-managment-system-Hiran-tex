import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from "../../../utils/auth.js";
import { CreditCard, Package, CheckCircle, XCircle, Clipboard, Mail, RefreshCw, Truck, Search } from 'lucide-react';
import "./PaymentQueue.css";


const HISTORICAL_ORDERS_SAMPLE = [
    {
        order_id: 10250,
        customer_name: "Anura Perera",
        order_date: "2026-03-15",
        total_amount: 12450.00,
        order_status: "DELIVERED",
        payment_status: "COMPLETED",
        delivery_type: "Gampaha"
    },
    {
        order_id: 10251,
        customer_name: "Samanthi Silva",
        order_date: "2026-03-16",
        total_amount: 8900.00,
        order_status: "PROCESSING",
        payment_status: "COMPLETED",
        delivery_type: "Store Pickup"
    },
    {
        order_id: 10252,
        customer_name: "Ruwan Kumara",
        order_date: "2026-03-17",
        total_amount: 15600.00,
        order_status: "PENDING",
        payment_status: "PENDING",
        delivery_type: "Out of Gampaha"
    }
];

const PaymentQueue = () => {
    const navigate = useNavigate();
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [specialMessage, setSpecialMessage] = useState('');

    useEffect(() => {
        fetchPendingPayments();

        // Implement Live Update (Polling every 30 seconds)
        const interval = setInterval(() => {
            fetchPendingPayments();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchPendingPayments = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/pending-payments`);
            const data = await response.json();
            if (response.ok) {
                setPendingPayments(data.orders || []);
            }
        } catch (err) {
            console.error('Error fetching pending payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async (paymentId, methodOrStatus) => {
        try {
            setActionLoading(true);
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/payments/confirm`, {
                method: 'POST',
                body: JSON.stringify({
                    payment_id: paymentId,
                    status: methodOrStatus === 'FAILED' ? 'FAILED' : 'COMPLETED',
                    confirmedBy: 'Salesperson',
                    method: methodOrStatus === 'FAILED' ? 'N/A' : methodOrStatus
                })
            });

            if (response.ok) {
                alert(`Payment ${methodOrStatus === 'FAILED' ? 'rejected' : 'confirmed'} successfully.`);
                fetchPendingPayments();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || 'Failed to process payment'}`);
            }
        } catch (err) {
            console.error('Error confirming payment:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendConfirmation = async (orderId, type, customMessage = null) => {
        try {
            setActionLoading(true);
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/send-confirmation`, {
                method: 'POST',
                body: JSON.stringify({
                    orderId,
                    type,
                    sentBy: 'Salesperson',
                    customMessage
                })
            });

            if (response.ok) {
                alert(`${customMessage ? 'Special message' : type.replace('_', ' ')} sent successfully!`);
                setShowConfirmationModal(false);
                setSelectedOrder(null);
                setSpecialMessage('');
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send confirmation');
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };



    return (
        <div className="payment-queue-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1>Payment Processing Queue</h1>
                </div>
                <div className="header-actions">
                    <button onClick={fetchPendingPayments} className="refresh-btn" disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                        Sync Data
                    </button>
                </div>
            </div>
            <p className="subtitle" style={{ color: '#666', fontSize: '15px', marginBottom: '30px' }}>Monitor and verify incoming customer payments</p>

            <div className="filters-bar" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div className="queue-count">
                    Found {pendingPayments.length} pending payments
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <RefreshCw size={40} className="spinning" />
                    <p>Loading pending transactions...</p>
                </div>
            ) : pendingPayments.length > 0 ? (
                <div className="payments-grid">
                    {pendingPayments.map(order => (
                        <div key={order.order_id} className="payment-card">
                            <div className="card-header">
                                <div className="order-id">Order #{order.order_id}</div>
                                <div className={`method-badge ${order.payment_method}`}>
                                    {order.payment_method.replace(/_/g, ' ')}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="customer-info">
                                    <h3>{order.customer_name}</h3>
                                    <div className="contact-details" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Mail size={14} /> {order.phone_number || 'N/A'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                            <Package size={14} style={{ marginTop: '3px', flexShrink: 0 }} /> 
                                            <span style={{ lineHeight: '1.4' }}>{order.delivery_address || 'No address provided'}</span>
                                        </div>
                                    </div>
                                    <p className="order-date" style={{ marginTop: '12px', fontStyle: 'italic' }}>{new Date(order.order_date).toLocaleDateString()}</p>
                                </div>

                                <div className="amount-section">
                                    <span className="label">Amount to Collect:</span>
                                    <span className="value">Rs. {Number(order.total_amount).toLocaleString()}</span>
                                </div>

                                <div className="items-preview">
                                    <h4>Order Contents:</h4>
                                    <ul>
                                        {(order.items || []).map((item, idx) => (
                                            <li key={idx}>
                                                <span>{item.fabric_name} (x{item.quantity}m)</span>
                                                <span>Rs. {Number(item.total_price).toLocaleString()}</span>
                                            </li>
                                        ))}
                                        {order.delivery_fee > 0 && (
                                            <li className="delivery-row" style={{ fontWeight: '600', color: '#001a66', borderTop: '1px solid #eee', marginTop: '5px', paddingTop: '5px' }}>
                                                <span>Delivery Fee:</span>
                                                <span>Rs. {Number(order.delivery_fee).toLocaleString()}</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="slip-section">
                                    <h4>Bank Slip Proof:</h4>
                                    <div className="slip-thumbnail" onClick={() => order.bank_slip_url && window.open(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${order.bank_slip_url}`, '_blank')}>
                                        {order.bank_slip_url ? (
                                            <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${order.bank_slip_url}`} alt="Slip" />
                                        ) : (
                                            <div className="placeholder-slip" style={{ height: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                <Package size={32} />
                                                <span style={{ fontSize: '11px', marginTop: '8px' }}>No slip uploaded yet</span>
                                            </div>
                                        )}
                                        {order.bank_slip_url && (
                                            <div className="overlay">
                                                <Search size={20} />
                                                <span>Click to View Full</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="card-footer">
                                <button 
                                    className="btn confirm"
                                    onClick={() => handleConfirmPayment(order.payment_id, order.payment_method)}
                                    disabled={actionLoading}
                                >
                                    <CheckCircle size={18} /> Confirm Payment
                                </button>
                                <button 
                                    className="btn reject"
                                    onClick={() => {
                                        if (window.confirm("Mark this payment as REJECTED? You should notify the customer next.")) {
                                            handleConfirmPayment(order.payment_id, 'FAILED');
                                            setSelectedOrder(order);
                                            setShowConfirmationModal(true);
                                        }
                                    }}
                                    disabled={actionLoading}
                                >
                                    <XCircle size={18} /> Reject Payment
                                </button>
                                <button 
                                    className="btn notify"
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setShowConfirmationModal(true);
                                    }}
                                    disabled={actionLoading}
                                    style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}
                                >
                                    <Mail size={18} /> Notify
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">📂</div>
                    <h3>No Pending Payments</h3>
                    <p>Great job! All payment transactions have been processed.</p>
                </div>
            )}

            {/* Customer Confirmation Modal */}
            {showConfirmationModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowConfirmationModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '25px', borderRadius: '15px', maxWidth: '500px', width: '90%' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Mail size={24} color="#001a66" />
                                <h3 style={{ margin: 0 }}>Client Communication</h3>
                            </div>
                            <button onClick={() => {
                                setShowConfirmationModal(false);
                                setSpecialMessage('');
                            }} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="order-summary" style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                                <h4 style={{ margin: '0 0 10px 0' }}>Order #{selectedOrder.order_id}</h4>
                                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                            </div>
                            
                            <div className="confirmation-types" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <h5 style={{ margin: '0 0 5px 0' }}>Select Quick Message:</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button 
                                        className="btn confirmation-type"
                                        onClick={() => handleSendConfirmation(selectedOrder.order_id, 'payment_confirmation')}
                                        disabled={actionLoading}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white', fontSize: '13px', color: 'black' }}
                                    >
                                        <span>Verified Receipt</span>
                                    </button>
                                    <button 
                                        className="btn confirmation-type"
                                        onClick={() => handleSendConfirmation(selectedOrder.order_id, 'payment_rejection')}
                                        disabled={actionLoading}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '8px', border: '1px solid #001a66', cursor: 'pointer', background: 'white', fontSize: '13px', color: '#001a66' }}
                                    >
                                        <span>Reject & Ask for New Slip</span>
                                    </button>
                                    <button 
                                        className="btn confirmation-type"
                                        onClick={() => handleSendConfirmation(selectedOrder.order_id, 'delivery_update')}
                                        disabled={actionLoading}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white', fontSize: '13px', color: 'black' }}
                                    >
                                        <span>Delivery Update</span>
                                    </button>
                                </div>

                                <div className="special-message-section" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                    <h5 style={{ margin: '0 0 10px 0' }}>Send Special Message:</h5>
                                    <textarea 
                                        placeholder="Type your custom message here..."
                                        value={specialMessage}
                                        onChange={(e) => setSpecialMessage(e.target.value)}
                                        style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'inherit', fontSize: '14px', marginBottom: '10px', resize: 'vertical' }}
                                    />
                                    <button 
                                        className="btn send-special"
                                        onClick={() => handleSendConfirmation(selectedOrder.order_id, 'order_confirmation', specialMessage)}
                                        disabled={actionLoading || !specialMessage.trim()}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#001a66', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', opacity: (actionLoading || !specialMessage.trim()) ? 0.6 : 1 }}
                                    >
                                        Send Special Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PaymentQueue;
