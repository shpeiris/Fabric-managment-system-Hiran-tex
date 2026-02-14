import React, { useState } from 'react';
import './CompleteOrder.css';

const CompleteOrder = ({ 
  cartItems, 
  orderData, 
  updateOrderData, 
  calculateSubtotal, 
  calculateTotal, 
  nextStep, 
  prevStep,
  error,
  setError 
}) => {
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!orderData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!orderData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,11}$/.test(orderData.phoneNumber.replace(/[-\s]/g, ''))) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!orderData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setError(null);
      nextStep();
    }
  };

  const handleInputChange = (field, value) => {
    updateOrderData({ [field]: value });
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const deliveryFee = orderData.deliveryMethod === 'HOME_DELIVERY' ? 500 : 0;

  return (
    <div className="complete-order-container">
      <div className="order-form-section">
        <div className="step-indicator">
          <h2>Complete Your Order</h2>
          <p className="step-text">Step 2 of 4</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="customer-details-form">
          <h3>Customer Information</h3>
          
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              value={orderData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={formErrors.fullName ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {formErrors.fullName && <span className="error-text">{formErrors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              value={orderData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={formErrors.phoneNumber ? 'error' : ''}
              placeholder="Enter your phone number"
            />
            {formErrors.phoneNumber && <span className="error-text">{formErrors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="deliveryAddress">Delivery Address *</label>
            <textarea
              id="deliveryAddress"
              value={orderData.deliveryAddress}
              onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
              className={formErrors.deliveryAddress ? 'error' : ''}
              placeholder="Enter your complete delivery address"
              rows="3"
            />
            {formErrors.deliveryAddress && <span className="error-text">{formErrors.deliveryAddress}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="specialInstructions">Special Instructions (Optional)</label>
            <textarea
              id="specialInstructions"
              value={orderData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special requests or instructions for your order"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Delivery Method</label>
            <div className="delivery-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="HOME_DELIVERY"
                  checked={orderData.deliveryMethod === 'HOME_DELIVERY'}
                  onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                />
                <span className="radio-button"></span>
                <div className="option-content">
                  <strong>Home Delivery</strong>
                  <p>Delivered to your doorstep (Rs. 500 delivery fee)</p>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="STORE_PICKUP"
                  checked={orderData.deliveryMethod === 'STORE_PICKUP'}
                  onChange={(e) => handleInputChange('deliveryMethod', e.target.value)}
                />
                <span className="radio-button"></span>
                <div className="option-content">
                  <strong>Store Pickup</strong>
                  <p>Collect from our store (Free)</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={prevStep} className="btn-secondary">
            Back to Cart
          </button>
          <button onClick={handleNext} className="btn-primary">
            Continue to Payment
          </button>
        </div>
      </div>

      <div className="order-summary-section">
        <div className="order-summary-card">
          <h3>Order Summary</h3>
          
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item.cart_id} className="order-item">
                <div className="item-info">
                  <h4>{item.fabric_name}</h4>
                  <p className="item-details">
                    {item.color && `${item.color} • `}
                    {item.material_type}
                  </p>
                  <p className="item-quantity">Quantity: {item.quantity} meters</p>
                </div>
                <div className="item-price">
                  <span className="price-per-unit">Rs. {parseFloat(item.price_per_meter).toFixed(2)}/m</span>
                  <span className="total-price">Rs. {(parseFloat(item.price_per_meter) * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
              <span>Rs. {calculateSubtotal().toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee > 0 ? `Rs. ${deliveryFee.toFixed(2)}` : 'Free'}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Grand Total</span>
              <span>Rs. {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteOrder;