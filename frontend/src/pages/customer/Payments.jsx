jjjjjjj  import { useState, useEffect } from 'react'
import { apiCall } from "../../utils/auth";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOrder, setUploadOrder] = useState(null); // Order ID to upload slip for
  const [slipFile, setSlipFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiCall('http://localhost:5000/api/orders');
      const data = await response.json();
      if (response.ok) {
        setPayments(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipFile) return alert("Please select a bank slip image");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('order_id', uploadOrder);
      formData.append('slip', slipFile);

      const response = await apiCall('http://localhost:5000/api/payments/upload-slip', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setUploadSuccess(true);
        fetchPayments();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload slip");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading slip");
    } finally {
      setLoading(false);
    }
  };

  const closeUploadModal = () => {
    setUploadOrder(null);
    setSlipFile(null);
    setUploadSuccess(false);
  };

  // Status mapping based on schema.sql (PENDING, PROCESSING, DELIVERED, CANCELLED)
  const pendingPayments = payments.filter(p => 
    p.order_status === 'PENDING' && 
    (!p.latest_payment_status || p.latest_payment_status === 'PENDING')
  );
  
  const completedPayments = payments.filter(p => 
    p.order_status === 'PROCESSING' || 
    p.order_status === 'DELIVERED' || 
    p.latest_payment_status === 'COMPLETED'
  );

  return (
    <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto', background: 'transparent' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '5px', color: '#001a66', fontWeight: '700' }}>Payments & Settlements</h1>
          <p style={{ color: '#666', fontSize: '15px', marginBottom: '30px' }}>Verify your pending orders by uploading bank deposit slips.</p>
        </div>
      </div>

      {/* Pending Payments Section */}
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#dc3545', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>⚠️</span> Action Required: Pending Payments
      </h2>
      
      {pendingPayments.length === 0 ? (
        <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px dashed #e5e7eb' }}>
          <p style={{ color: '#6b7280' }}>All clear! You have no pending payments requiring action.</p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Order Ref</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Amount Due</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Current Status</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.map(p => (
                <tr key={p.order_id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px', color: '#2563eb', fontWeight: '500' }}>ORD-{p.order_id.toString().padStart(4, '0')}</td>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#1f2937' }}>Rs. {Number(p.total_amount).toLocaleString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      background: p.latest_payment_status === 'PENDING' ? '#fff7ed' : '#f0f9ff', 
                      color: p.latest_payment_status === 'PENDING' ? '#c2410c' : '#0369a1', 
                      padding: '4px 12px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {p.latest_payment_status === 'PENDING' ? 'Processing Slip' : 'Payment Required'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {p.bank_slip_url ? (
                      <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '13px' }}>Proof Submitted</span>
                    ) : (
                      <button
                        onClick={() => setUploadOrder(p.order_id)}
                        style={{ 
                          background: '#001a66', 
                          color: 'white', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '6px', 
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'background 0.2s'
                        }}
                      >
                        Upload Proof
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {uploadOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            {!uploadSuccess ? (
              <>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Verify Your Payment</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Please upload a clear photo or screenshot of your bank deposit slip for Order #ORD-{uploadOrder.toString().padStart(4, '0')}.</p>
                
                <div style={{ marginBottom: '24px' }}>
                  <div 
                    style={{ 
                      border: '2px dashed #e5e7eb', 
                      borderRadius: '8px', 
                      padding: '30px', 
                      textAlign: 'center',
                      background: '#f9fafb',
                      cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById('slip-file-input').click()}
                  >
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📂</span>
                    <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>
                      {slipFile ? slipFile.name : 'Click to select or drag and drop slip image'}
                    </span>
                    <input
                      id="slip-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSlipFile(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    onClick={closeUploadModal} 
                    style={{ background: 'white', border: '1px solid #e5e7eb', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: '#4b5563' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUploadBankSlip} 
                    disabled={loading}
                    style={{ background: '#001a66', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Uploading...' : 'Submit Proof'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#001a66', marginBottom: '12px' }}>Upload Successful!</h3>
                <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                  Your bank slip has been sent to the salesperson. <br /> 
                  They will verify it shortly and update your order status.
                </p>
                <button 
                  onClick={closeUploadModal} 
                  style={{ background: '#001a66', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%' }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Payments Section */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Recent Transactions</h2>
      {completedPayments.length === 0 ? <p style={{ color: '#6b7280' }}>No recent transaction history.</p> : (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Execution Date</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Net Amount</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Final Status</th>
              </tr>
            </thead>
            <tbody>
              {completedPayments.map(p => (
                <tr key={p.order_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px', color: '#6b7280' }}>{new Date(p.order_date).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', color: '#1f2937', fontWeight: '500' }}>ORD-{p.order_id.toString().padStart(4, '0')}</td>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#1f2937' }}>Rs. {Number(p.total_amount).toLocaleString()}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      PAID & VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
