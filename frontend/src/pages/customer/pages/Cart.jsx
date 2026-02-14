import { useState } from 'react'
import fabric1 from "../../../assets/Fabrics/lasecotton.png";
import fabric2 from "../../../assets/Fabrics/cover-fabric.png";
import fabric3 from "../../../assets/Fabrics/inventory01.png";

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    { id: 'FAB001', name: 'Cotton Blend Blue', price: 250, quantity: 5, image: fabric1 },
    { id: 'FAB002', name: 'Silk Satin Red', price: 650, quantity: 3, image: fabric2 },
    { id: 'FAB003', name: 'Linen White', price: 420, quantity: 8, image: fabric3 }
  ])

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 500
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>Shopping Cart</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>
        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Cart Items */}
        <div>
          {cartItems.map(item => (
            <div key={item.id} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px',
              display: 'flex',
              gap: '20px'
            }}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>{item.name}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>{item.id}</p>
                <p style={{ fontSize: '16px', color: '#2563eb', fontWeight: '600' }}>Rs. {item.price}/meter</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  ×
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      background: '#f3f4f6',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '500', minWidth: '30px', textAlign: 'center' }}>
                    {item.quantity}m
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      background: '#f3f4f6',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    +
                  </button>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>Your cart is empty</p>
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
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Order Summary</h3>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>Rs. {total.toFixed(0)}</span>
            </div>

            <button style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              cursor: 'pointer',
              fontWeight: '600',
              width: '100%',
              marginBottom: '10px'
            }}>
              Proceed to Checkout
            </button>

            <button style={{
              background: 'transparent',
              color: '#2563eb',
              border: '1px solid #2563eb',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              width: '100%'
            }}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
