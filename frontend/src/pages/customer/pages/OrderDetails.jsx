import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import orderService from '../../../services/orderService'
import cartService from '../../../services/cartService'
import paymentService from '../../../services/paymentService'
import customerService from '../../../services/customerService'
import { apiCall } from '../../../utils/auth.js'
import './OrderDetails.css'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  
  const [invoiceData, setInvoiceData] = useState(null)
  const [isPrinting, setIsPrinting] = useState(false)

  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [newFeedback, setNewFeedback] = useState({
    overall_rating: 0,
    fabric_quality: 0,
    delivery: 0,
    customer_service: 0,
    comments: ''
  })
  
  useEffect(() => {
    if (id) {
      fetchOrderDetails()
    }
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrderById(id)
      
      // Fetch notifications for this specific order
      const notifResponse = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/customer/notifications`)
      if (notifResponse.ok) {
        const notifData = await notifResponse.json()
        data.notifications = notifData.notifications.filter(n => n.order_id === parseInt(id))
      }
      
      setOrderData(data)
      
      // If delivered, check for existing feedback
      if (data.order.order_status === 'DELIVERED') {
        try {
          const fbData = await customerService.getOrderFeedback(id)
          if (fbData.feedback) {
            setFeedback(fbData.feedback)
          }
        } catch (fbErr) {
          console.error("Error fetching feedback:", fbErr)
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error("Error fetching order details:", err)
      setError("Failed to load order details.")
      setLoading(false)
    }
  }

  const handleReorder = async () => {
    try {
      if (!orderData || !orderData.items) return
      
      setLoading(true)
      const reorderPromises = orderData.items.map(item => 
        cartService.addToCart({
          fabric_id: item.fabric_id,
          quantity: item.quantity
        })
      )
      
      await Promise.all(reorderPromises)
      alert("Items added to cart successfully!")
      navigate('/customer/cart')
    } catch (err) {
      console.error("Reorder error:", err)
      alert("Failed to reorder items. Some items might be out of stock.")
    } finally {
      setLoading(false)
    }
  }

  const handlePrintInvoice = async () => {
    try {
      setIsPrinting(true);
      // Fetch or generate invoice
      let invRes = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/invoices/order/${id}`);
      if (!invRes.ok) {
        // Try generating
        invRes = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/invoices/generate/${id}`, { method: 'POST' });
        if (!invRes.ok) throw new Error("Failed to generate invoice");
      }
      const data = await invRes.json();
      setInvoiceData(data);
      
      // Delay slightly for React to re-render the printable section before printing
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 300);
    } catch (err) {
      console.error("Print error:", err);
      // Fallback to print anyway if it fails to get invoice number
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 300);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Basic validation
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image (JPG, PNG) or PDF file')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUploadSlip = async () => {
    if (!selectedFile) {
      alert("Please select a file first")
      return
    }

    try {
      setUploadLoading(true)
      const formData = new FormData()
      formData.append('order_id', id)
      formData.append('slip', selectedFile)

      await paymentService.uploadPaymentProof(formData)
      setUploadSuccess(true)
      setSelectedFile(null)
      fetchOrderDetails() // Refresh data
    } catch (err) {
      console.error("Upload error:", err)
      alert("Failed to upload bank slip. Please try again.")
    } finally {
      setUploadLoading(false)
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    if (newFeedback.fabric_quality === 0 || newFeedback.delivery === 0) {
      alert("Please provide ratings for both Fabric Quality and Delivery Service")
      return
    }

    try {
      setSubmittingFeedback(true)
      
      // Calculate overall_rating as average of quality and delivery for legacy DB field
      const overall = Math.round((newFeedback.fabric_quality + newFeedback.delivery) / 2)
      
      // Prepare clean feedback data for the API
      const feedbackPayload = {
        order_id: id,
        overall_rating: overall,
        fabric_quality: newFeedback.fabric_quality,
        delivery: newFeedback.delivery,
        customer_service: newFeedback.customer_service || null,
        comments: newFeedback.comments || null
      }

      await customerService.submitFeedback(feedbackPayload)
      
      alert("Thank you for your feedback!")
      
      // Refresh to show the submitted feedback
      const fbData = await customerService.getOrderFeedback(id)
      if (fbData.feedback) {
        setFeedback(fbData.feedback)
      }
    } catch (err) {
      console.error("Feedback submission error:", err)
      alert(err.error || "Failed to submit feedback. Please try again.")
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (loading && !orderData) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading order details...</div>
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>
  if (!orderData) return <div style={{ padding: '40px', textAlign: 'center' }}>Order not found.</div>

  const { order, items } = orderData
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseFloat(item.quantity)), 0)
  const getDeliveryFee = (type) => {
    if (type === 'GAMPAHA') return 500;
    if (type === 'OUT_OF_GAMPAHA') return 750;
    if (type === 'STORE_PICKUP') return 0;
    return 500; // Default
  }

  const deliveryFee = getDeliveryFee(order.delivery_type)
  const tax = 0 // Using 0 as tax is usually included in total or not applicable here yet

  return (
    <div>
      <button 
        onClick={() => navigate('/customer/orders')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '20px',
          padding: '0'
        }}
      >
        <span>←</span> Back to My Orders
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '5px', color: '#1f2937', fontWeight: '600' }}>Order Details</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Order #{order.order_id} • Placed on {new Date(order.order_date).toLocaleString()}</p>
        </div>
        <span style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '8px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {order.order_status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left Column */}
        <div>
          {/* Order Items */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Order Items</h2>
            {items.map(item => (
              <div key={item.order_item_id} style={{
                display: 'flex',
                gap: '15px',
                paddingBottom: '15px',
                marginBottom: '15px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: '#f3f4f6', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🧶
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>{item.fabric_name}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>#{item.fabric_id}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Quantity: {item.quantity} meters</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>Rs. {parseFloat(item.total_price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Information */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Delivery Information</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Delivery Type</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {order.delivery_type === 'STORE_PICKUP' ? '🏪 Store Pickup' : 
                   order.delivery_type === 'GAMPAHA' ? '🚚 Gampaha Suburbs Delivery' : 
                   order.delivery_type === 'OUT_OF_GAMPAHA' ? '🚛 Out of Gampaha Delivery' : 
                   order.delivery_type?.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Address</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {order.delivery_address}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Payment Information</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Transaction Date</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{new Date(order.order_date).toLocaleString()}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Amount Paid</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#22c55e' }}>Rs. {parseFloat(order.total_amount).toLocaleString()}</p>
              </div>
              {order.bank_slip_url && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Bank Slip Proof</p>
                  <div style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    maxWidth: '300px'
                  }}>
                    <img 
                      src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${order.bank_slip_url}`} 
                      alt="Bank Slip" 
                      style={{ width: '100%', cursor: 'pointer' }}
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${order.bank_slip_url}`, '_blank')}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Click image to view full size</p>
                </div>
              )}

              {/* Upload section for PENDING BANK_TRANSFER orders without slip */}
              {order.order_status === 'PENDING' && !order.bank_slip_url && order.payment_method === 'BANK_TRANSFER' && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  background: uploadSuccess ? '#f0fdf4' : '#fef2f2', 
                  border: `1px dashed ${uploadSuccess ? '#22c55e' : '#ef4444'}`, 
                  borderRadius: '8px' 
                }}>
                  <p style={{ fontSize: '14px', color: uploadSuccess ? '#166534' : '#b91c1c', fontWeight: '600', marginBottom: '10px' }}>
                    {uploadSuccess ? '✅ Slip Uploaded Successfully!' : 'Action Required: Upload Payment Slip'}
                  </p>
                  <p style={{ fontSize: '12px', color: uploadSuccess ? '#166534' : '#7f1d1d', marginBottom: '15px' }}>
                    {uploadSuccess ? 'Your payment verification is now in progress. Our team will review the slip shortly.' : 'Your order is pending bank transfer verification. Please upload your bank slip to proceed.'}
                  </p>
                  {uploadSuccess ? (
                    <button 
                      onClick={() => navigate('/customer/orders')}
                      style={{
                        background: '#22c55e',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      ← Back to My Orders
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="file" 
                        onChange={handleFileChange} 
                        accept="image/*,.pdf"
                        style={{ fontSize: '13px' }}
                      />
                      <button 
                        onClick={handleUploadSlip}
                        disabled={uploadLoading || !selectedFile}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: (uploadLoading || !selectedFile) ? 'not-allowed' : 'pointer',
                          opacity: (uploadLoading || !selectedFile) ? 0.7 : 1
                        }}
                      >
                        {uploadLoading ? 'Uploading...' : 'Upload Slip'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* New: Status Updates / Notifications */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            marginTop: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Status Updates</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {orderData.notifications && orderData.notifications.length > 0 ? (
                orderData.notifications.map((notif, idx) => (
                  <div key={idx} style={{ 
                    padding: '12px', 
                    background: '#f9fafb', 
                    borderRadius: '6px',
                    borderLeft: '4px solid #2563eb'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
                        {notif.confirmation_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        {new Date(notif.sent_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>{notif.message_content}</p>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '14px', color: '#6b7280' }}>No status updates yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Order Summary</h2>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Delivery</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Rs. {deliveryFee.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Tax</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Rs. {tax.toFixed(0)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>Rs. {parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '15px' }}>Actions</h2>
            <button 
              onClick={handlePrintInvoice}
              disabled={isPrinting}
              style={{
                background: 'transparent',
                color: '#2563eb',
                border: '1px solid #2563eb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: isPrinting ? 'not-allowed' : 'pointer',
                opacity: isPrinting ? 0.7 : 1,
                fontWeight: '500',
                width: '100%',
                marginBottom: '10px'
              }}
            >
              {isPrinting ? 'Preparing Invoice...' : 'Print Invoice'}
            </button>
            <button style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              width: '100%',
              marginBottom: '10px'
            }} onClick={handleReorder}>
              Reorder All Items
            </button>
            <button style={{
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              width: '100%'
            }}>
              Contact Support
            </button>
          </div>

          {/* Feedback Section */}
          {order.order_status === 'DELIVERED' && (
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '25px',
              marginTop: '20px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>
                {feedback ? 'Your Review' : 'Rate Your Order'}
              </h2>

              {feedback ? (
                <div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                      Fabric Quality:
                    </div>
                    <div style={{ fontSize: '20px', color: '#fbbf24', marginBottom: '10px' }}>
                      {'★'.repeat(feedback.fabric_quality || 0)}{'☆'.repeat(5 - (feedback.fabric_quality || 0))}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                      Delivery Service:
                    </div>
                    <div style={{ fontSize: '20px', color: '#fbbf24', marginBottom: '15px' }}>
                      {'★'.repeat(feedback.delivery || 0)}{'☆'.repeat(5 - (feedback.delivery || 0))}
                    </div>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#4b5563', fontStyle: feedback.comments ? 'normal' : 'italic', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
                    {feedback.comments || 'No comments provided.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback}>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#1f2937', marginBottom: '8px', fontWeight: '500' }}>Fabric Quality:</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewFeedback({ ...newFeedback, fabric_quality: star })}
                          style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: star <= newFeedback.fabric_quality ? '#fbbf24' : '#e5e7eb', padding: 0 }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#1f2937', marginBottom: '8px', fontWeight: '500' }}>Delivery Service:</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewFeedback({ ...newFeedback, delivery: star })}
                          style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: star <= newFeedback.delivery ? '#fbbf24' : '#e5e7eb', padding: 0 }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <textarea
                      placeholder="Share your experience..."
                      value={newFeedback.comments}
                      onChange={(e) => setNewFeedback({ ...newFeedback, comments: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '13px',
                        minHeight: '80px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      width: '100%',
                      cursor: submittingFeedback ? 'not-allowed' : 'pointer',
                      opacity: submittingFeedback ? 0.7 : 1
                    }}
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Printable Invoice Section */}
      <div className="printable-invoice">
        <div className="invoice-header">
          <div className="invoice-title-section">
            <h1>INVOICE</h1>
            <p>Hiran Fabric Textile</p>
          </div>
          <div className="company-details">
            <h2>Hiran Fabric Textile</h2>
            <p>No 72, New Shopping Complex</p>
            <p>Nittambuwa, Sri Lanka</p>
            <p>+94 77 112 4088</p>
            <p>hiranfabrictextile@gmail.com</p>
          </div>
        </div>

        <div className="invoice-meta">
          <div className="bill-to">
            <h3>Bill To:</h3>
            <p><strong>{order.customer_name || 'Customer'}</strong></p>
            <p>{order.delivery_address || 'Address not provided'}</p>
          </div>
          <div className="invoice-info-table">
            <table>
              <tbody>
                <tr>
                  <th>Invoice Number:</th>
                  <td>{invoiceData?.invoice_number || `INV-PENDING`}</td>
                </tr>
                <tr>
                  <th>Date Issued:</th>
                  <td>{invoiceData ? new Date(invoiceData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <th>Order Reference:</th>
                  <td>#{order.order_id}</td>
                </tr>
                <tr>
                  <th>Order Date:</th>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="right">Quantity (m)</th>
              <th className="right">Unit Price</th>
              <th className="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.order_item_id}>
                <td>
                  <strong>{item.fabric_name}</strong>
                  <div style={{color: '#6b7280', fontSize: '12px'}}>Item #{item.fabric_id}</div>
                </td>
                <td className="right">{item.quantity}</td>
                <td className="right">Rs. {parseFloat(item.unit_price).toFixed(2)}</td>
                <td className="right">Rs. {parseFloat(item.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <table>
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td className="right">Rs. {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              <tr>
                <td>Delivery</td>
                <td className="right">Rs. {deliveryFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td className="right">Rs. {tax.toFixed(2)}</td>
              </tr>
              <tr className="total-row">
                <td>Total Due</td>
                <td className="right">Rs. {parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="invoice-footer">
          <p>Thank you for your business! For any inquiries regarding this invoice, please contact us.</p>
          <p>This is a computer-generated document and requires no physical signature.</p>
        </div>
      </div>
    </div>
  )
}
