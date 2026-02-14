import React from 'react';
import './OrderConfirmation.css';

const OrderConfirmation = ({ orderId, orderData, totalAmount, navigate }) => {
  const handleGenerateInvoice = () => {
    // This would typically download or open an invoice PDF
    console.log('Generate invoice for order:', orderId);
    // For now, we'll show an alert
    alert('Invoice generation feature will be implemented soon!');
  };

  const handleShareFeedback = () => {
    navigate('/customer/feedback');
  };

  const handleViewOrderHistory = () => {
    navigate('/customer/orders');
  };

  const handleContinueShopping = () => {
    navigate('/customer/browse');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-content">
        <div className="success-header">
          <div className="success-icon">
            <div className="checkmark">✓</div>
          </div>
          <h1 className="success-title">Confirmed!</h1>
          <p className="success-message">Your order has been placed successfully</p>
        </div>

        <div className="order-details-card">
          <h2>Order Details</h2>
          
          <div className="order-info-grid">
            <div className="info-item">
              <label>Order ID</label>
              <span className="order-id">#{orderId}</span>
            </div>

            <div className="info-item">
              <label>Total Amount</label>
              <span className="total-amount">Rs. {totalAmount.toFixed(2)}</span>
            </div>

            <div className="info-item">
              <label>Delivery Method</label>
              <span>{orderData.deliveryMethod === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup'}</span>
            </div>

            <div className="info-item">
              <label>Order Date</label>
              <span>{formatDate(new Date())}</span>
            </div>

            <div className="info-item">
              <label>Payment Method</label>
              <span>
                {orderData.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash on Delivery'}
              </span>
            </div>

            <div className="info-item">
              <label>Status</label>
              <span className="status-pending">Pending</span>
            </div>
          </div>

          <div className="delivery-details">
            <h3>Delivery Information</h3>
            <div className="delivery-info">
              <p><strong>Name:</strong> {orderData.fullName}</p>
              <p><strong>Phone:</strong> {orderData.phoneNumber}</p>
              <p><strong>Address:</strong> {orderData.deliveryAddress}</p>
              {orderData.specialInstructions && (
                <p><strong>Special Instructions:</strong> {orderData.specialInstructions}</p>
              )}
            </div>
          </div>

          {orderData.paymentMethod === 'BANK_TRANSFER' && (
            <div className="payment-notice">
              <div className="notice-content">
                <h4>Payment Verification</h4>
                <p>
                  Your payment slip has been received and is being verified. 
                  You will be notified once payment is confirmed and your order is processed.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <div className="primary-actions">
            <button onClick={handleGenerateInvoice} className="btn-secondary">
              📄 Generate Invoice
            </button>
            <button onClick={handleShareFeedback} className="btn-secondary">
              💬 Share Feedback
            </button>
          </div>
          
          <div className="secondary-actions">
            <button onClick={handleViewOrderHistory} className="btn-outline">
              📋 View Order History
            </button>
            <button onClick={handleContinueShopping} className="btn-primary">
              🛒 Continue Shopping
            </button>
          </div>
        </div>

        <div className="next-steps">
          <h3>What happens next?</h3>
          <div className="steps-timeline">
            <div className="timeline-step completed">
              <div className="step-icon">✓</div>
              <div className="step-content">
                <h4>Order Placed</h4>
                <p>Your order has been received</p>
              </div>
            </div>

            <div className="timeline-step pending">
              <div className="step-icon">2</div>
              <div className="step-content">
                <h4>Payment Verification</h4>
                <p>We're verifying your payment</p>
              </div>
            </div>

            <div className="timeline-step pending">
              <div className="step-icon">3</div>
              <div className="step-content">
                <h4>Processing</h4>
                <p>Your order will be prepared</p>
              </div>
            </div>

            <div className="timeline-step pending">
              <div className="step-icon">4</div>
              <div className="step-content">
                <h4>
                  {orderData.deliveryMethod === 'HOME_DELIVERY' ? 'Delivery' : 'Ready for Pickup'}
                </h4>
                <p>
                  {orderData.deliveryMethod === 'HOME_DELIVERY' 
                    ? 'Your order will be delivered' 
                    : 'You can collect your order'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-support">
          <h4>Need Help?</h4>
          <p>
            If you have any questions about your order, please contact us at{' '}
            <a href="mailto:support@fabricstore.com">support@fabricstore.com</a>{' '}
            or call <a href="tel:+94771234567">+94 77 123 4567</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;