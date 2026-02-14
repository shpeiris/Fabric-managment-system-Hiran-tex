import { useState, useEffect } from 'react'
import { apiCall } from "../../utils/auth";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOrder, setUploadOrder] = useState(null); // Order ID to upload slip for
  const [slipUrl, setSlipUrl] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // We fetch orders because that's where we attached payment status
      const response = await apiCall('http://localhost:5000/api/orders');
      const data = await response.json();
      if (response.ok) {
        // Filter orders that have made payments or need payments
        // For history: orders with payment attempts
        // For pending: orders where invoice is PENDING
        setPayments(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSlip = async () => {
    if (!slipUrl) return alert("Please enter slip URL");

    try {
      const response = await apiCall('http://localhost:5000/api/payments/upload-slip', {
        method: 'POST',
        body: JSON.stringify({ order_id: uploadOrder, slip_url: slipUrl })
      });

      if (response.ok) {
        alert("Slip uploaded successfully!");
        setUploadOrder(null);
        setSlipUrl('');
        fetchPayments();
      } else {
        alert("Failed to upload slip");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading slip");
    }
  };

  const pendingPayments = payments.filter(p => p.invoice_status === 'PENDING' && p.latest_payment_status !== 'COMPLETED');
  const completedPayments = payments.filter(p => p.invoice_status === 'PAID' || p.latest_payment_status === 'COMPLETED');

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>Payments</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Manage your payments and upload bank slips.</p>

      {/* Pending Payments Section */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#dc3545', marginBottom: '20px' }}>Pending Payments</h2>
      {pendingPayments.length === 0 ? <p>No pending payments.</p> : (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayments.map(p => (
                <tr key={p.order_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px', color: '#2563eb' }}>#{p.order_id}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>Rs. {Number(p.total_amount).toLocaleString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
                      {p.latest_payment_status || 'Unpaid'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {p.latest_payment_status === 'PENDING' ? (
                      <span>Processing...</span>
                    ) : (
                      <button
                        onClick={() => setUploadOrder(p.order_id)}
                        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Upload Bank Slip
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Upload Bank Slip for Order #{uploadOrder}</h3>
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Slip Image URL</label>
              <input
                type="text"
                value={slipUrl}
                onChange={(e) => setSlipUrl(e.target.value)}
                placeholder="https://example.com/slip.jpg"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setUploadOrder(null)} style={{ background: '#ccc', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleUploadSlip} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Payment History</h2>
      {completedPayments.length === 0 ? <p>No completed payments.</p> : (
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {completedPayments.map(p => (
                <tr key={p.order_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>{new Date(p.order_date).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px', color: '#1f2937' }}>#{p.order_id}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>Rs. {Number(p.total_amount).toLocaleString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
                      Paid
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
