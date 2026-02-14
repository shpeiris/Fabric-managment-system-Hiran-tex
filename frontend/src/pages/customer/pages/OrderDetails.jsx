export default function OrderDetails() {
  const order = {
    id: 'ORD001',
    date: '2024-01-20',
    status: 'Delivered',
    trackingNumber: 'TRK123456',
    items: [
      { id: 'FAB001', name: 'Cotton Blend Blue', price: 250, quantity: 5, image: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400' },
      { id: 'FAB002', name: 'Silk Satin Red', price: 650, quantity: 3, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' },
      { id: 'FAB003', name: 'Linen White', price: 420, quantity: 8, image: 'https://images.unsplash.com/photo-1593032465171-b9a5cc3c52b8?w=400' }
    ],
    shipping: {
      name: 'John Doe',
      address: '123 Main Street',
      city: 'Colombo',
      postalCode: '00100',
      phone: '+94 77 123 4567'
    },
    payment: {
      method: 'Credit Card',
      last4: '4242',
      amount: 9650
    }
  }

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 500
  const tax = subtotal * 0.08

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', marginBottom: '5px', color: '#1f2937', fontWeight: '600' }}>Order Details</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Order #{order.id} • Placed on {order.date}</p>
        </div>
        <span style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '8px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {order.status}
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
            {order.items.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                gap: '15px',
                paddingBottom: '15px',
                marginBottom: '15px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>{item.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{item.id}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>Quantity: {item.quantity} meters</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
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
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Recipient</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{order.shipping.name}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Address</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {order.shipping.address}<br/>
                  {order.shipping.city} {order.shipping.postalCode}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Phone</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{order.shipping.phone}</p>
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
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Payment Method</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{order.payment.method} •••• {order.payment.last4}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Transaction Date</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{order.date}</p>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Amount Paid</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#22c55e' }}>Rs. {order.payment.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div>
          {/* Tracking */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '15px' }}>Tracking</h2>
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Tracking Number</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>{order.trackingNumber}</p>
            </div>
            <button style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              width: '100%'
            }}>
              Track Shipment
            </button>
          </div>

          {/* Order Summary */}
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
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>Rs. {order.payment.amount.toLocaleString()}</span>
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
            <button style={{
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
            }}>
              Download Invoice
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
            }}>
              Reorder Items
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
