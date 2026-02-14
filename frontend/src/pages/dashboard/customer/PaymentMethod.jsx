import React, { useState } from 'react';
import './PaymentMethod.css';

const PaymentMethod = ({ 
  cartItems, 
  orderData, 
  updateOrderData, 
  calculateSubtotal, 
  calculateTotal, 
  prevStep,
  submitOrder,
  error,
  setError 
}) => {
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const bankDetails = {
    bankName: "People's Bank",
    accountName: "Fabric Management System",
    accountNumber: "1234567890",
    branch: "Colombo 01"
  };

  const validateForm = () => {
    const errors = {};

    if (!orderData.paymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    }

    if (orderData.paymentMethod === 'BANK_TRANSFER' && !orderData.bankSlipFile) {
      errors.bankSlip = 'Please upload payment slip for bank transfer';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentMethodChange = (method) => {
    updateOrderData({ paymentMethod: method });
    if (formErrors.paymentMethod) {
      setFormErrors(prev => ({ ...prev, paymentMethod: '' }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      updateOrderData({ bankSlipFile: file });
      setError(null);
      if (formErrors.bankSlip) {
        setFormErrors(prev => ({ ...prev, bankSlip: '' }));
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If bank transfer with file, we would upload the file here
      // For now, we'll just proceed with the order
      await submitOrder();
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const deliveryFee = orderData.deliveryMethod === 'HOME_DELIVERY' ? 500 : 0;

  return (
    <div className="payment-method-container">
      <div className="payment-form-section">
        <div className="step-indicator">
          <h2>Payment Method</h2>
          <p className="step-text">Step 3 of 4</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="payment-options">
          <h3>Choose Payment Method</h3>
          
          <div className="payment-method-group">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="BANK_TRANSFER"
                checked={orderData.paymentMethod === 'BANK_TRANSFER'}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
              />
              <span className="radio-button"></span>
              <div className="option-content">
                <div className="option-header">
                  <strong>Bank Transfer</strong>
                  <span className="option-badge">Preferred</span>
                </div>
                <p>Transfer money to our bank account and upload payment slip</p>
              </div>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="CASH_ON_DELIVERY"
                checked={orderData.paymentMethod === 'CASH_ON_DELIVERY'}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
              />
              <span className="radio-button"></span>
              <div className="option-content">
                <strong>Cash on Delivery</strong>
                <p>Pay when your order is delivered (Available for home delivery only)</p>
              </div>
            </label>
          </div>

          {formErrors.paymentMethod && (
            <span className="error-text">{formErrors.paymentMethod}</span>
          )}
        </div>

        {orderData.paymentMethod === 'BANK_TRANSFER' && (
          <div className="bank-transfer-details">
            <h4>Bank Transfer Details</h4>
            <div className="bank-info-card">
              <div className="bank-detail">
                <strong>Bank:</strong> {bankDetails.bankName}
              </div>
              <div className="bank-detail">
                <strong>Account Name:</strong> {bankDetails.accountName}
              </div>
              <div className="bank-detail">
                <strong>Account Number:</strong> {bankDetails.accountNumber}
              </div>
              <div className="bank-detail">
                <strong>Branch:</strong> {bankDetails.branch}
              </div>
              <div className="bank-detail total-amount">
                <strong>Amount to Transfer:</strong> Rs. {calculateTotal().toFixed(2)}
              </div>
            </div>

            <div className="file-upload-section">
              <label htmlFor="bankSlipUpload" className="upload-label">
                Upload Payment Slip *
              </label>
              <div className="upload-area">
                <input
                  type="file"
                  id="bankSlipUpload"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                <div className="upload-content">
                  {orderData.bankSlipFile ? (
                    <div className="file-selected">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{orderData.bankSlipFile.name}</span>
                      <span className="file-size">
                        ({(orderData.bankSlipFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <span className="upload-icon">📎</span>
                      <span>Click to upload payment slip</span>
                      <p className="upload-hint">JPG, PNG or PDF (max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
              {formErrors.bankSlip && (
                <span className="error-text">{formErrors.bankSlip}</span>
              )}
            </div>
          </div>
        )}

        {orderData.paymentMethod === 'CASH_ON_DELIVERY' && orderData.deliveryMethod === 'STORE_PICKUP' && (
          <div className="payment-warning">
            <p>⚠️ Cash on Delivery is not available for Store Pickup. Please select Bank Transfer or change delivery method to Home Delivery.</p>
          </div>
        )}

        <div className="form-actions">
          <button onClick={prevStep} className="btn-secondary">
            Back
          </button>
          <button 
            onClick={handlePlaceOrder} 
            className="btn-primary place-order-btn"
            disabled={loading || (orderData.paymentMethod === 'CASH_ON_DELIVERY' && orderData.deliveryMethod === 'STORE_PICKUP')}
          >
            {loading ? 'Processing...' : 'Place Order'}
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
                  <span>Rs. {(parseFloat(item.price_per_meter) * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
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

          <div className="delivery-info">
            <h4>Delivery Information</h4>
            <p><strong>Name:</strong> {orderData.fullName}</p>
            <p><strong>Phone:</strong> {orderData.phoneNumber}</p>
            <p><strong>Method:</strong> {orderData.deliveryMethod === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup'}</p>
            <p><strong>Address:</strong> {orderData.deliveryAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;