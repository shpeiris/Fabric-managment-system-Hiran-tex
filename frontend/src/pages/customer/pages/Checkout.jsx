import { useState } from 'react'

export default function Checkout() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })

  const cartItems = [
    { id: 'FAB001', name: 'Cotton Blend Blue', price: 250, quantity: 5 },
    { id: 'FAB002', name: 'Silk Satin Red', price: 650, quantity: 3 },
    { id: 'FAB003', name: 'Linen White', price: 420, quantity: 8 }
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 500
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    // Handle order submission
    console.log('Order submitted', formData)
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>Complete Your Order</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Fill in your details to complete the purchase.</p>

      {/* Progress Steps */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', justifyContent: 'center' }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: step >= s ? '#2563eb' : '#e5e7eb',
              color: step >= s ? 'white' : '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              {s}
            </div>
            {s < 3 && (
              <div style={{
                width: '100px',
                height: '2px',
                background: step > s ? '#2563eb' : '#e5e7eb'
              }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Left Column - Forms */}
        <div>
          {/* Shipping Information */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Shipping Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Colombo"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Postal Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="00100"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Payment Method</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', padding: '15px', border: '2px solid #2563eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit-card"
                  checked={formData.paymentMethod === 'credit-card'}
                  onChange={handleChange}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Credit/Debit Card</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank-transfer"
                  checked={formData.paymentMethod === 'bank-transfer'}
                  onChange={handleChange}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Bank Transfer</span>
              </label>
            </div>

            {formData.paymentMethod === 'credit-card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Expiry Date *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '25px',
            position: 'sticky',
            top: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Order Summary</h2>

            {/* Items */}
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '15px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.quantity}m × Rs. {item.price}</p>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
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
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Tax (8%)</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Rs. {tax.toFixed(0)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>Rs. {total.toFixed(0)}</span>
            </div>

            <button
              onClick={handleSubmit}
              style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                width: '100%'
              }}
            >
              Confirm & Pay
            </button>

            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '15px' }}>
              🔒 Secure payment processing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
