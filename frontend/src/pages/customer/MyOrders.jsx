import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../utils/auth.js";

export default function Orders() {
  const [selectedTab, setSelectedTab] = useState('all')

  const orders = [
    { id: 'ORD001', date: '2024-01-20', items: 3, total: 'Rs. 15,000', status: 'Delivered', trackingNumber: 'TRK123456' },
    { id: 'ORD002', date: '2024-01-18', items: 2, total: 'Rs. 8,500', status: 'In Transit', trackingNumber: 'TRK123457' },
    { id: 'ORD003', date: '2024-01-15', items: 5, total: 'Rs. 22,000', status: 'Processing', trackingNumber: 'TRK123458' },
    { id: 'ORD004', date: '2024-01-12', items: 4, total: 'Rs. 18,500', status: 'Delivered', trackingNumber: 'TRK123459' },
    { id: 'ORD005', date: '2024-01-10', items: 2, total: 'Rs. 9,200', status: 'Cancelled', trackingNumber: 'TRK123460' }
  ]

  const filteredOrders = selectedTab === 'all'
    ? orders
    : orders.filter(order => order.status.toLowerCase() === selectedTab)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#d1fae5', color: '#065f46' }
      case 'In Transit':
        return { bg: '#dbeafe', color: '#1e40af' }
      case 'Processing':
        return { bg: '#fef3c7', color: '#92400e' }
      case 'Cancelled':
        return { bg: '#fee2e2', color: '#991b1b' }
      default:
        return { bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>My Orders</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Track and manage your fabric orders.</p>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb' }}>
        {['all', 'processing', 'in transit', 'delivered', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'transparent',
              color: selectedTab === tab ? '#2563eb' : '#6b7280',
              borderBottom: selectedTab === tab ? '2px solid #2563eb' : 'none',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: selectedTab === tab ? '600' : '400',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredOrders.map(order => {
          const statusStyle = getStatusColor(order.status)
          return (
            <div key={order.id} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>
                    Order {order.id}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    Placed on {order.date} • {order.items} items
                  </p>
                </div>
                <span style={{
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {order.status}
                </span>
              </div>

              <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Tracking Number</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{order.trackingNumber}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total Amount</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>{order.total}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{
                    background: 'transparent',
                    color: '#2563eb',
                    border: '1px solid #2563eb',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                    View Details
                  </button>
                  {order.status === 'In Transit' && (
                    <button style={{
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      Track Order
                    </button>
                  )}
                  {order.status === 'Delivered' && (
                    <button style={{
                      background: '#22c55e',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>No orders found</p>
          <button style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Start Shopping
          </button>
        </div>
      )}
    </div>
  )
}
