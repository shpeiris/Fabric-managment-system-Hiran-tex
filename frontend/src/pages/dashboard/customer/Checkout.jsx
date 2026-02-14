import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompleteOrder from "./CompleteOrder.jsx";
import PaymentMethod from "./PaymentMethod.jsx";
import OrderConfirmation from "./OrderConfirmation.jsx";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  // Hardcoded cart data matching ShoppingCart.jsx
  const [cartItems, setCartItems] = useState([
    {
      cart_id: 1,
      fabric_id: 101,
      material_type: "Cotton",
      fabric_name: "Premium Cotton Blue",
      color: "Blue",
      price_per_meter: "450.00",
      quantity: 5,
    },
    {
      cart_id: 2,
      fabric_id: 102,
      material_type: "Silk",
      fabric_name: "Elegant Silk Red",
      color: "Red",
      price_per_meter: "1200.00",
      quantity: 2,
    },
    {
      cart_id: 3,
      fabric_id: 103,
      material_type: "Linen",
      fabric_name: "Pure Linen White",
      color: "White",
      price_per_meter: "850.00",
      quantity: 3,
    },
  ]);
  const [orderData, setOrderData] = useState({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
    specialInstructions: "",
    deliveryMethod: "HOME_DELIVERY",
    paymentMethod: "",
    bankSlipFile: null,
  });
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Removed useEffect fetchCart call since data is hardcoded

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price_per_meter || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + price * quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = orderData.deliveryMethod === "HOME_DELIVERY" ? 500 : 0;
    return subtotal + deliveryFee;
  };

  const updateOrderData = (data) => {
    setOrderData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitOrder = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setOrderId(Math.floor(Math.random() * 10000) + 1000); // Generate random order ID
        setCurrentStep(4); // Go to confirmation
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error("Error placing order:", err);
      setError(err.message || "Failed to place order");
      setLoading(false);
    }
  };

  const renderStepProgress = () => {
    const steps = [
      { number: 1, title: "Cart", completed: currentStep > 1 },
      { number: 2, title: "Order Details", completed: currentStep > 2 },
      { number: 3, title: "Payment", completed: currentStep > 3 },
      { number: 4, title: "Confirmation", completed: currentStep > 4 },
    ];

    return (
      <div className="checkout-progress">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`progress-step ${currentStep === step.number ? "active" : ""} ${step.completed ? "completed" : ""}`}
          >
            <div className="step-circle">
              {step.completed ? "✓" : step.number}
            </div>
            <span className="step-title">{step.title}</span>
            {index < steps.length - 1 && <div className="step-line"></div>}
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    const commonProps = {
      cartItems,
      orderData,
      updateOrderData,
      calculateSubtotal,
      calculateTotal,
      nextStep,
      prevStep,
      error,
      setError,
    };

    switch (currentStep) {
      case 2:
        return <CompleteOrder {...commonProps} />;
      case 3:
        return <PaymentMethod {...commonProps} submitOrder={submitOrder} />;
      case 4:
        return (
          <OrderConfirmation
            orderId={orderId}
            orderData={orderData}
            totalAmount={calculateTotal()}
            navigate={navigate}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && currentStep < 3) {
    return (
      <div className="checkout-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/customer/cart")}
            className="btn-back"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  // Start from step 2 since step 1 is the cart page
  if (currentStep === 1) {
    setCurrentStep(2);
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        {renderStepProgress()}
      </div>

      <div className="checkout-content">{renderStepContent()}</div>
    </div>
  );
};

export default Checkout;
