import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import orderService from '../../../services/orderService'
import cartService from '../../../services/cartService'
import paymentService from '../../../services/paymentService'
import { apiCall } from '../../../utils/auth.js'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const [uploadSuccess, setUploadSuccess] = useState(false)
  
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
      const notifResponse = await apiCall(`http://localhost:5000/api/customer/notifications`)
      if (notifResponse.ok) {
        const notifData = await notifResponse.json()
        data.notifications = notifData.notifications.filter(n => n.order_id === parseInt(id))
      }
      
      setOrderData(data)
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

  if (loading && !orderData) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading order details...</div>
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</div>
  if (!orderData) return <div style={{ padding: '40px', textAlign: 'center' }}>Order not found.</div>

  const { order, items } = orderData
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseFloat(item.quantity)), 0)
  const getShippingFee = (type) => {
    if (type === 'GAMPAHA') return 500;
    if (type === 'OUT_OF_GAMPAHA') return 750;
    if (type === 'STORE_PICKUP') return 0;
    return 500; // Default
  }

  const shipping = getShippingFee(order.delivery_type)
  const tax = 0 // Using 0 as tax is usually included in total or not applicable here yet

  return (
    <div>
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

          {/* Shipping Information */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Shipping Information</h2>
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
                      src={`http://localhost:5000/${order.bank_slip_url}`} 
                      alt="Bank Slip" 
                      style={{ width: '100%', cursor: 'pointer' }}
                      onClick={() => window.open(`http://localhost:5000/${order.bank_slip_url}`, '_blank')}
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
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Shipping</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Rs. {shipping.toLocaleString()}</span>
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
              onClick={() => window.print()}
              style={{
                background: 'transparent',
                color: '#2563eb',
                border: '1px solid #2563eb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                width: '100%',
                marginBottom: '10px'
              }}
            >
              Print Invoice
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
        </div>
      </div>
    </div>
  )
}
