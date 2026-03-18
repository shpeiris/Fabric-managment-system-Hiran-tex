import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CompleteOrder from "./CompleteOrder.jsx";
import PaymentMethod from "./PaymentMethod.jsx";
import OrderConfirmation from "./OrderConfirmation.jsx";
import cartService from "../../../services/cartService";
import orderService from "../../../services/orderService";
import paymentService from "../../../services/paymentService";
import { getUser } from "../../../utils/auth";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
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

  useEffect(() => {
    const fetchCartAndUser = async () => {
      try {
        setLoading(true);
        // Fetch cart
        const cartData = await cartService.getCart();
        const items = cartData.cart || [];
        if (items.length === 0) {
          navigate("/customer/cart");
          return;
        }
        setCartItems(items);

        // Pre-fill user data
        const user = getUser();
        if (user) {
          setOrderData(prev => ({
            ...prev,
            fullName: user.full_name || user.name || "",
            phoneNumber: user.phone || user.tel || "",
            deliveryAddress: user.address || ""
          }));
        }
      } catch (err) {
        console.error("Error initializing checkout:", err);
        setError("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndUser();
  }, [navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price_per_meter || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + price * quantity;
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    let deliveryFee = 0;
    
    switch (orderData.deliveryMethod) {
      case 'GAMPAHA':
      case 'GAMPAHA_SUBURBS':
        deliveryFee = 500;
        break;
      case 'OUT_OF_GAMPAHA':
        deliveryFee = 750;
        break;
      default:
        deliveryFee = 0;
    }
    
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
      setError(null);

      const itemsPayload = cartItems.map(item => ({
        fabric_id: item.fabric_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.price_per_meter)
      }));

      const payload = {
        items: itemsPayload,
        delivery_address: orderData.deliveryAddress,
        delivery_type: orderData.deliveryMethod,
        payment_method: orderData.paymentMethod,
        customer_name: orderData.fullName,
        phone_number: orderData.phoneNumber,
        special_instructions: orderData.specialInstructions
      };

      const result = await orderService.createOrder(payload);
      
      if (result.order_id) {
        setOrderId(result.order_id);

        // If bank transfer and file selected, upload slip
        if (orderData.paymentMethod === 'BANK_TRANSFER' && orderData.bankSlipFile) {
          const formData = new FormData();
          formData.append('order_id', result.order_id);
          formData.append('slip', orderData.bankSlipFile);
          
          try {
            await paymentService.uploadPaymentProof(formData);
          } catch (uploadErr) {
            console.error("Slip upload failed:", uploadErr);
            // We don't fail the whole order if just the slip upload failed
            // maybe show a warning later
          }
        }

        setCurrentStep(4); // Go to confirmation
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setError(err.error || "Failed to place order. Please try again.");
    } finally {
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
