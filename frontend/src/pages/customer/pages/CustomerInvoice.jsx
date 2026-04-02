import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import orderService from '../../../services/orderService'
import { getUser } from '../../../utils/auth.js'
import './CustomerInvoice.css'

export default function CustomerInvoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)

  useEffect(() => {
    // We grab the session user to display generic customer info if not fully embedded in the order
    setCustomerInfo(getUser())
    if (id) {
      fetchOrderDetails()
    }
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrderById(id)
      setOrderData(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching order details for invoice:", err)
      setError("Failed to load invoice details.")
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="invoice-loading">Generating Invoice Document...</div>
  if (error) return <div className="invoice-error">{error}</div>
  if (!orderData) return <div className="invoice-error">Invoice Data Not Found.</div>

  const { order, items } = orderData
  
  // Calculate pricing elements identically to checkout
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * parseFloat(item.quantity)), 0)
  
  const getDeliveryFee = (type) => {
    if (type === 'GAMPAHA') return 500;
    if (type === 'OUT_OF_GAMPAHA') return 750;
    if (type === 'STORE_PICKUP') return 0;
    return 500; // Default
  }
  const deliveryFee = getDeliveryFee(order.delivery_type)
  const tax = 0 // Synchronized with OrderDetails.jsx logic

  return (
    <div className="invoice-wrapper">
      
      {/* On-screen controls hidden during print */}
      <div className="invoice-actions no-print">
        <button 
          className="btn-back-inv"
          onClick={() => navigate(`/customer/order-details/${order.order_id}`)}
        >
          ← Back to Order
        </button>
        <button 
          className="btn-print"
          onClick={handlePrint}
        >
          🖨️ Print Document
        </button>
      </div>

      {/* The Printable A4 Invoice Document */}
      <div className="invoice-document" id="printable-invoice">
        
        {/* Header Ribbon */}
        <div className="invoice-header">
          <div className="brand-section">
            <h1>Hiran Fabric Textile</h1>
            <p>Address: No 72, New Shopping Complex, Nittambuwa</p>
            <p>Mobile: +94 77 112 4088</p>
            <p>Email: hiranfabrictextile@gmail.com</p>
          </div>
          <div className="invoice-meta">
            <h2>INVOICE</h2>
            <div className="invoice-details">
              <span><strong>Invoice #:</strong> {order.invoice_id || `PENDING-${order.order_id}`}</span>
              <span><strong>Date Issued:</strong> {order.invoice_date ? new Date(order.invoice_date).toLocaleDateString() : 'N/A'}</span>
              <span><strong>Order Ref:</strong> {order.order_id}</span>
              <span><strong>Payment:</strong> {order.payment_method?.replace('_', ' ') || 'Cash on Delivery'}</span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Data */}
        <div className="billing-info">
          <div className="info-block">
            <h3>Billed To</h3>
            <p><strong>{order.customer_name || customerInfo?.full_name || customerInfo?.name || 'Valued Customer'}</strong></p>
            <p>{order.phone_number || customerInfo?.phone || customerInfo?.tel || 'No phone provided'}</p>
          </div>
          <div className="info-block">
            <h3>Delivery Details</h3>
            <p><strong>Method:</strong> {order.delivery_type?.replace('_', ' ')}</p>
            <p><strong>Address:</strong><br/>{order.delivery_address || 'Store Pickup'}</p>
          </div>
        </div>

        {/* Dynamic Item Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th width="45%">Description</th>
              <th className="center">Fabric ID</th>
              <th className="right">Unit Price</th>
              <th className="center">Qty (m)</th>
              <th className="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.fabric_name}</td>
                <td className="center">#{item.fabric_id}</td>
                <td className="right">Rs. {parseFloat(item.unit_price).toFixed(2)}</td>
                <td className="center">{parseFloat(item.quantity)}</td>
                <td className="right">Rs. {parseFloat(item.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Calculation */}
        <div className="invoice-summary">
          <table className="summary-table">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td className="amount">Rs. {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              <tr>
                <td>Delivery Fee</td>
                <td className="amount">Rs. {deliveryFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td className="amount">Rs. {tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
              <tr className="total-row">
                <td>Grand Total</td>
                <td className="amount">Rs. {parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notice string */}
        <div className="invoice-footer">
          <p>Thank you for shopping with Hiran Fabric Textile!</p>
          <p style={{fontSize: '12px', marginTop: '5px'}}>This is a computer-generated document. No signature is required.</p>
        </div>

      </div>
    </div>
  )
}
