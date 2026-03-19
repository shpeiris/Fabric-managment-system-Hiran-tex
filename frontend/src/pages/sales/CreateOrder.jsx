import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../utils/auth.js";
import { 
  ShoppingCart, 
  ArrowLeft, 
  User, 
  MapPin, 
  CreditCard, 
  PackageSearch,
  Plus,
  Trash2,
  CheckCircle2
} from "lucide-react";
import "./CreateOrder.css";

export default function NewOrder() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [fabrics, setFabrics] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [cart, setCart] = useState([]);
    const [selectedFabricName, setSelectedFabricName] = useState("");
    const [selectedFabric, setSelectedFabric] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [deliveryType] = useState("Pickup");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
        fetchFabrics();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await apiCall("http://localhost:5000/api/sales/customers");
            const data = await res.json();
            if (res.ok) setCustomers(data.customers || []);
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    };

    const fetchFabrics = async () => {
        try {
            const res = await apiCall("http://localhost:5000/api/fabrics");
            const data = await res.json();
            if (res.ok) setFabrics(data.fabrics || []);
        } catch (err) {
            console.error("Error fetching fabrics:", err);
        }
    };

    const addToCart = () => {
        if (!selectedFabric) return alert("Select a fabric");
        if (quantity <= 0) return alert("Invalid quantity");

        const fabricFn = fabrics.find(f => f.fabric_id == selectedFabric);
        if (!fabricFn) return;

        const qtyNum = Number(quantity);
        if (qtyNum > Number(fabricFn.stock_available_quantity)) {
            return alert(`Insufficient stock! Available: ${fabricFn.stock_available_quantity}m`);
        }

        const newItem = {
            fabric_id: fabricFn.fabric_id,
            name: `${fabricFn.name} (${fabricFn.color || 'Standard'})`,
            price: Number(fabricFn.price_per_meter),
            quantity: qtyNum,
            total: Number(fabricFn.price_per_meter) * qtyNum
        };

        setCart([...cart, newItem]);
        setSelectedFabric("");
        setQuantity(1);
    };

    const removeFromCart = (idx) => {
        const newCart = [...cart];
        newCart.splice(idx, 1);
        setCart(newCart);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCustomer && !customerName.trim()) return alert("Please select a customer or type a Walk-in Name");
        if (cart.length === 0) return alert("Order cart is empty");

        try {
            setLoading(true);
            const payload = {
                customer_id: selectedCustomer || null,
                customer_name: customerName.trim() || undefined,
                phone_number: phoneNumber.trim() || undefined,
                items: cart.map(item => ({ fabric_id: item.fabric_id, quantity: item.quantity })),
                delivery_address: address,
                delivery_type: deliveryType,
                payment_method: paymentMethod
            };

            const res = await apiCall("http://localhost:5000/api/sales/orders", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                alert("Order placed successfully! Order ID: " + data.order_id);
                setCart([]);
                setSelectedCustomer("");
                setCustomerName("");
                setPhoneNumber("");
                setAddress("");
                navigate("/sales/orders"); // Optional: Navigate back to orders list
            } else {
                alert(data.error || "Order failed");
            }
        } catch (err) {
            console.error("Order error:", err);
            alert("Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);



    return (
        <div className="new-order-page">
            <div className="new-order-header">
                <div>
                    <h1>New Walk-in Order</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0' }}>Create an order for an in-store customer</p>
                </div>
                <button className="btn-back-dashboard" onClick={() => navigate('/sales/dashboard')}>
                    <ArrowLeft size={16} /> Dashboard
                </button>
            </div>

            <div className="new-order-grid">
                {/* LEFT COLUMN: SELECTION */}
                <div className="order-form-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Customer Info Card */}
                    <div className="order-section-card">
                        <h3><User size={20} color="#3b82f6" /> Customer Details</h3>
                        
                        <div className="form-row" style={{ alignItems: 'flex-start' }}>
                            <div className="form-group">
                                <label>Select Existing Customer</label>
                                <select 
                                    value={selectedCustomer} 
                                    onChange={(e) => {
                                        setSelectedCustomer(e.target.value);
                                        if (e.target.value) setCustomerName("");
                                    }}
                                >
                                    <option value="">-- Choose Account --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>OR Type Walk-in Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Name (No Account)" 
                                    value={customerName}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value);
                                        if (e.target.value) setSelectedCustomer("");
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Number (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 0771234567" 
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Home Address (Optional)</label>
                                <textarea 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)} 
                                    placeholder="Enter full home/delivery address"
                                    style={{ minHeight: '40px', resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Delivery Method</label>
                                <select value={deliveryType} disabled>
                                    <option value="Pickup">Store Pickup (Walk-in)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Payment Method</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    <option value="Cash">Cash at Counter</option>
                                    <option value="Card">Credit/Debit Card (POS)</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Add Fabrics Card */}
                    <div className="order-section-card">
                        <h3><PackageSearch size={20} color="#3b82f6" /> Add Fabrics to Order</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Select Fabric Material</label>
                                <select 
                                    value={selectedFabricName} 
                                    onChange={(e) => {
                                        setSelectedFabricName(e.target.value);
                                        setSelectedFabric("");
                                    }}
                                >
                                    <option value="">-- Browse Inventory --</option>
                                    {[...new Set(fabrics.map(f => f.name))].map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Select Color</label>
                                {selectedFabricName ? (
                                    <div className="swatch-grid">
                                        {fabrics.filter(f => f.name === selectedFabricName).map(f => (
                                            <button
                                                key={f.fabric_id}
                                                type="button"
                                                className={`swatch-item ${f.fabric_id == selectedFabric ? 'active' : ''}`}
                                                style={{ backgroundColor: f.color || '#cccccc' }}
                                                onClick={() => setSelectedFabric(f.fabric_id)}
                                                title={`${f.color || 'Standard'} - Current: ${f.stock_available_quantity}m`}
                                            >
                                                {f.fabric_id == selectedFabric && <span className="active-indicator"></span>}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '10px 0' }}>
                                        Please select a material first
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="form-row" style={{ alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Quantity (Meters)</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={quantity} 
                                    onChange={(e) => setQuantity(e.target.value)} 
                                />
                            </div>
                            <button className="btn-add-item" onClick={addToCart}>
                                <Plus size={18} /> Add Item
                            </button>
                        </div>
                    </div>



                </div>

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="order-section-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <h3><ShoppingCart size={20} color="#3b82f6" /> Order Summary</h3>
                    
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <ShoppingCart size={48} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
                            <p>No items added yet.<br/>Select a fabric to start building the order.</p>
                        </div>
                    ) : (
                        <div className="cart-items-list">
                            {cart.map((item, idx) => (
                                <div key={idx} className="cart-item">
                                    <div className="cart-item-info">
                                        <h4>{item.name}</h4>
                                        <p className="cart-item-meta">{item.quantity} meters x Rs.{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="cart-item-action">
                                        <div className="cart-item-price">
                                            <span className="cart-item-total">Rs.{item.total.toFixed(2)}</span>
                                        </div>
                                        <button className="btn-remove" onClick={() => removeFromCart(idx)} title="Remove Item">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="order-totals">
                        <div className="total-row">
                            <span>Subtotal ({cart.length} items)</span>
                            <span>Rs. {totalAmount.toFixed(2)}</span>
                        </div>

                        <div className="total-row grand-total">
                            <span>Grand Total</span>
                            <span>Rs. {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        className="btn-place-order"
                        onClick={handleSubmit}
                        disabled={loading || cart.length === 0}
                    >
                        {loading ? "Processing..." : (
                            <>
                                <CheckCircle2 size={20} /> Place Walk-in Order
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
