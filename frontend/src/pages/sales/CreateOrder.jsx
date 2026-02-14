import { useState, useEffect } from "react";
import { apiCall } from "../../utils/auth.js";
import "./Orders.css"; // Need to check where Orders.css is

export default function NewOrder() {
    const [customers, setCustomers] = useState([]);
    const [fabrics, setFabrics] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [cart, setCart] = useState([]);
    const [selectedFabric, setSelectedFabric] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [deliveryType, setDeliveryType] = useState("Pickup");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
        fetchFabrics();
    }, []);

    const fetchCustomers = async () => {
        try {
            // Reusing the sales customers endpoint
            const res = await apiCall("http://localhost:5000/api/sales/customers");
            const data = await res.json();
            if (res.ok) setCustomers(data.customers || []);
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    };

    const fetchFabrics = async () => {
        try {
            // Reusing the inventory fabrics endpoint or public endpoint
            // Using public one to be safe if salesperson doesn't have inventory access, 
            // but Salesperson usually calls /api/fabrics (public)
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

        if (quantity > fabricFn.stock_available_quantity) {
            return alert(`Insufficient stock! Available: ${fabricFn.stock_available_quantity}`);
        }

        const newItem = {
            fabric_id: fabricFn.fabric_id,
            name: fabricFn.name,
            price: fabricFn.price_per_meter,
            quantity: parseInt(quantity),
            total: fabricFn.price_per_meter * quantity
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
        if (!selectedCustomer) return alert("Select a customer");
        if (cart.length === 0) return alert("Cart is empty");

        try {
            setLoading(true);
            const payload = {
                customer_id: selectedCustomer,
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
                setAddress("");
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
        <div className="orders-page">
            <div className="header">
                <h1>Create New Order</h1>
            </div>

            <div className="new-order-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* LEFT COLUMN: SELECTION */}
                <div className="order-form-card" style={{ background: "#1e1e2d", padding: "20px", borderRadius: "8px" }}>
                    <h3>1. Customer Details</h3>
                    <div className="form-group">
                        <label>Select Customer</label>
                        <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                            <option value="">-- Choose Customer --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Delivery Method</label>
                        <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                            <option value="Pickup">Store Pickup</option>
                            <option value="Delivery">Home Delivery</option>
                        </select>
                    </div>

                    {deliveryType === "Delivery" && (
                        <div className="form-group">
                            <label>Delivery Address</label>
                            <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Payment Method</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Card">Credit/Debit Card</option>
                        </select>
                    </div>

                    <h3>2. Add Fabrics</h3>
                    <div className="form-group">
                        <label>Select Fabric</label>
                        <select value={selectedFabric} onChange={(e) => setSelectedFabric(e.target.value)}>
                            <option value="">-- Choose Fabric --</option>
                            {fabrics.map(f => (
                                <option key={f.fabric_id} value={f.fabric_id}>
                                    {f.name} (Rs.{f.price_per_meter}/m) - Stock: {f.stock_available_quantity}m
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Quantity (Meters)</label>
                        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                    <button className="btn-add" onClick={addToCart} style={{ marginTop: "10px", width: "100%" }}>Add to Order</button>
                </div>

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="order-preview-card" style={{ background: "#1e1e2d", padding: "20px", borderRadius: "8px" }}>
                    <h3>Order Summary</h3>
                    {cart.length === 0 ? <p>No items added.</p> : (
                        <table className="data-table" style={{ fontSize: "0.9rem" }}>
                            <thead>
                                <tr>
                                    <th>Fabric</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}m</td>
                                        <td>Rs.{item.total}</td>
                                        <td><button onClick={() => removeFromCart(idx)} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>X</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    <div className="order-total" style={{ marginTop: "20px", borderTop: "1px solid #333", paddingTop: "10px" }}>
                        <h2>Total: Rs. {totalAmount.toFixed(2)}</h2>
                    </div>

                    <button
                        className="btn-save"
                        onClick={handleSubmit}
                        disabled={loading || cart.length === 0}
                        style={{ width: "100%", marginTop: "20px", padding: "15px", fontSize: "1.1rem" }}
                    >
                        {loading ? "Processing..." : "Place Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
