import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../utils/auth.js";
import { 
  ShoppingCart, 
  ArrowLeft, 
  User, 
  PackageSearch,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  UserCheck,
  UserPlus
} from "lucide-react";
import "./CreateOrder.css";

export default function NewOrder() {
    const navigate = useNavigate();
    const [fabrics, setFabrics] = useState([]);

    // Customer lookup state
    const [phoneSearch, setPhoneSearch] = useState("");
    const [searching, setSearching] = useState(false);
    const [foundCustomer, setFoundCustomer] = useState(null);
    const [customerNotFound, setCustomerNotFound] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [address, setAddress] = useState("");
    const searchTimeout = useRef(null);

    const [cart, setCart] = useState([]);
    const [selectedFabricName, setSelectedFabricName] = useState("");
    const [selectedFabric, setSelectedFabric] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFabrics();
    }, []);

    const fetchFabrics = async () => {
        try {
            const res = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fabrics`);
            const data = await res.json();
            if (res.ok) setFabrics(data.fabrics || []);
        } catch (err) {
            console.error("Error fetching fabrics:", err);
        }
    };

    const handlePhoneChange = (val) => {
        setPhoneSearch(val);
        setFoundCustomer(null);
        setCustomerNotFound(false);
        setCustomerName("");
        setAddress("");
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (val.trim().length >= 7) {
            searchTimeout.current = setTimeout(() => searchCustomer(val.trim()), 600);
        }
    };

    const searchCustomer = async (phone) => {
        try {
            setSearching(true);
            const res = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/customers/search?phone=${encodeURIComponent(phone)}`);
            const data = await res.json();
            if (res.ok && data.found) {
                setFoundCustomer(data.customer);
                setCustomerName(data.customer.full_name);
                setAddress(data.customer.address || "");
                setCustomerNotFound(false);
            } else {
                setFoundCustomer(null);
                setCustomerNotFound(true);
            }
        } catch (err) {
            console.error("Customer search error:", err);
        } finally {
            setSearching(false);
        }
    };

    const clearCustomer = () => {
        setPhoneSearch("");
        setFoundCustomer(null);
        setCustomerNotFound(false);
        setCustomerName("");
        setAddress("");
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
        setCart([...cart, {
            fabric_id: fabricFn.fabric_id,
            name: `${fabricFn.name} (${fabricFn.color || 'Standard'})`,
            price: Number(fabricFn.price_per_meter),
            quantity: qtyNum,
            total: Number(fabricFn.price_per_meter) * qtyNum
        }]);
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
        if (!phoneSearch.trim() && !customerName.trim()) return alert("Please enter a customer phone number or name");
        if (cart.length === 0) return alert("Order cart is empty");
        try {
            setLoading(true);
            const payload = {
                customer_id: foundCustomer ? foundCustomer.customer_id : null,
                customer_name: foundCustomer ? foundCustomer.full_name : customerName.trim(),
                phone_number: phoneSearch.trim() || undefined,
                items: cart.map(item => ({ fabric_id: item.fabric_id, quantity: item.quantity })),
                delivery_address: address || "Store Walk-in",
                delivery_type: "STORE_PICKUP",
                payment_method: paymentMethod
            };
            const res = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/orders`, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Order placed!\nOrder ID: ${data.order_id}\nCustomer: ${payload.customer_name}`);
                setCart([]);
                clearCustomer();
                navigate("/sales/orders");
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h1>New Walk-in Order</h1>
                <button className="btn-back-dashboard" onClick={() => navigate('/sales/dashboard')}>
                    <ArrowLeft size={16} /> Dashboard
                </button>
            </div>
            <p className="subtitle">Create an order for an in-store customer</p>

            <div className="new-order-grid">
                {/* LEFT COLUMN: SELECTION */}
                <div className="order-form-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Customer Info Card */}
                    <div className="order-section-card">
                        <h3><User size={20} color="#3b82f6" /> Customer Lookup</h3>

                        {/* Phone Search */}
                        <div className="form-group">
                            <label>Customer Phone Number</label>
                            <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="text"
                                        placeholder="Enter phone number to search (e.g. 0771234567)"
                                        value={phoneSearch}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        style={{ paddingLeft: '34px' }}
                                    />
                                </div>
                                {(foundCustomer || customerNotFound) && (
                                    <button type="button" onClick={clearCustomer} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                        Clear
                                    </button>
                                )}
                            </div>
                            {searching && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>🔍 Searching...</p>}
                        </div>

                        {/* Returning Customer Found */}
                        {foundCustomer && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <UserCheck size={18} color="#16a34a" />
                                    <span style={{ fontWeight: '700', color: '#15803d', fontSize: '14px' }}>Returning Customer Found!</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '13px', color: '#166534' }}>
                                    <div><strong>ID:</strong> #{foundCustomer.customer_id}</div>
                                    <div><strong>Name:</strong> {foundCustomer.full_name}</div>
                                    <div><strong>Phone:</strong> {foundCustomer.tel}</div>
                                    <div><strong>Orders:</strong> {foundCustomer.total_orders} | Spent: Rs.{Number(foundCustomer.total_spent).toLocaleString()}</div>
                                </div>
                                {foundCustomer.address && <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}><strong>Address:</strong> {foundCustomer.address}</div>}
                            </div>
                        )}

                        {/* New Walk-in Customer */}
                        {customerNotFound && (
                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <UserPlus size={18} color="#d97706" />
                                    <span style={{ fontWeight: '700', color: '#b45309', fontSize: '14px' }}>New Customer — Enter Details</span>
                                </div>
                                <div className="form-group" style={{ marginBottom: '8px' }}>
                                    <label>Customer Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter full name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Address (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Enter address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="form-row">
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
