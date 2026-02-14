import { useState } from 'react'

export default function OrderHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const orders = [
    { id: 'ORD001', date: '2024-01-20', items: 3, total: 15000, status: 'Delivered' },
    { id: 'ORD002', date: '2024-01-18', items: 2, total: 8500, status: 'In Transit' },
    { id: 'ORD003', date: '2024-01-15', items: 5, total: 22000, status: 'Processing' },
    { id: 'ORD004', date: '2024-01-12', items: 4, total: 18500, status: 'Delivered' },
    { id: 'ORD005', date: '2024-01-10', items: 2, total: 9200, status: 'Delivered' },
    { id: 'ORD006', date: '2024-01-08', items: 6, total: 28000, status: 'Cancelled' },
    { id: 'ORD007', date: '2024-01-05', items: 3, total: 14500, status: 'Delivered' },
    { id: 'ORD008', date: '2024-01-03', items: 1, total: 5000, status: 'Delivered' }
  ]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch(status) {
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
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>My Orders History</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>View and track all your past orders.</p>

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            background: 'white',
            cursor: 'pointer',
            minWidth: '150px'
          }}
        >
          <option value="all">All Status</option>
          <option value="processing">Processing</option>
          <option value="in transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Items</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Total Amount</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontWeight: '600', color: '#374151', fontSize: '13px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => {
              const statusStyle = getStatusColor(order.status)
              return (
                <tr key={order.id} style={{ borderTop: index > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '16px', color: '#2563eb', fontWeight: '600' }}>{order.id}</td>
                  <td style={{ padding: '16px', color: '#6b7280' }}>{order.date}</td>
                  <td style={{ padding: '16px', color: '#1f2937' }}>{order.items} items</td>
                  <td style={{ padding: '16px', color: '#1f2937', fontWeight: '600' }}>Rs. {order.total.toLocaleString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button style={{
                      background: 'transparent',
                      color: '#2563eb',
                      border: '1px solid #2563eb',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      View Details
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '60px 20px',
          textAlign: 'center',
          marginTop: '20px'
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
