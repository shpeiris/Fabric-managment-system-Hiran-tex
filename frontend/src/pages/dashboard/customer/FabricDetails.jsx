import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../../../utils/auth.js';
import './FabricDetails.css';

const FabricDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [fabric, setFabric] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchFabricDetails();
    }, [id]);

    const fetchFabricDetails = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fabrics/${id}`);
            const data = await response.json();

            if (response.ok) {
                const fabricData = data.fabric;
                fabricData.price_per_meter = parseFloat(fabricData.price_per_meter);
                setFabric(fabricData);
                setError(null);
                
                // Fetch other variants of the same fabric
                fetchVariants(fabricData.name);
            } else {
                setError(data.error || 'Fabric not found');
            }
        } catch (err) {
            console.error('Error fetching fabric:', err);
            setError('Failed to load fabric details');
        } finally {
            setLoading(false);
        }
    };

    const fetchVariants = async (name) => {
        try {
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fabrics?search=${encodeURIComponent(name)}`);
            const data = await response.json();
            if (response.ok) {
                // Filter to ensure exact name match and include current fabric
                const matches = (data.fabrics || []).filter(f => f.name === name);
                setVariants(matches);
            }
        } catch (err) {
            console.error('Error fetching variants:', err);
        }
    };

    const handleAddToCart = async () => {
        if (!fabric) return;

        if (quantity <= 0 || isNaN(quantity)) {
            setCartMessage({ type: 'error', text: 'Please enter a valid quantity' });
            return;
        }

        if (quantity > fabric.stock_quantity) {
            setCartMessage({ type: 'error', text: `Only ${fabric.stock_quantity}m available in stock` });
            return;
        }

        try {
            setAddingToCart(true);
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fabric_id: fabric.fabric_id,
                    quantity: quantity
                })
            });

            if (response.ok) {
                setCartMessage({ type: 'success', text: '✅ Added to cart successfully!' });
                setTimeout(() => setCartMessage({ type: '', text: '' }), 3000);
            } else {
                const data = await response.json();
                setCartMessage({ type: 'error', text: `❌ ${data.error || 'Failed to add to cart'}` });
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            setCartMessage({ type: 'error', text: '❌ Failed to add to cart' });
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="details-page-wrapper">
                <div className="loader-container">
                    <div className="premium-spinner"></div>
                    <p>Fetching fabric details...</p>
                </div>
            </div>
        );
    }

    if (error || !fabric) {
        return (
            <div className="details-page-wrapper">
                <div className="error-card">
                    <h2>Oops!</h2>
                    <p>{error || 'Fabric not found'}</p>
                    <button onClick={() => navigate('/customer/browse')} className="btn-return">
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="details-page-wrapper">
            <button onClick={() => navigate('/customer/browse')} className="back-link">
                ← Back to Collection
            </button>

            <div className="details-container">
                {/* Left: High-Quality Image */}
                <div className="image-view">
                    <div className="image-frame">
                        <img
                            src={!fabric.image_url 
                                ? '/src/assets/Fabrics/fabric-collage.jpg' 
                                : (fabric.image_url.startsWith('uploads/') 
                                    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${fabric.image_url}` 
                                    : (fabric.image_url.startsWith('http') 
                                        ? fabric.image_url 
                                        : `/src/assets/Fabrics/${fabric.image_url}`))
                            }
                            alt={fabric.name}
                            className="main-fabric-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/src/assets/Fabrics/fabric-collage.jpg';
                            }}
                        />
                        {fabric.stock_quantity <= (fabric.reorder_level || 50) && (
                            <span className="stock-warning-label">
                                {fabric.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Modern Info Panel */}
                <div className="info-panel">
                    <div className="info-header">
                        <span className="category-tag">{fabric.material_type}</span>
                        <h1 className="fabric-title">{fabric.name}</h1>
                        <p className="fabric-sku">SKU: FAB{fabric.fabric_id.toString().padStart(3, '0')}</p>
                    </div>

                    <div className="pricing-box">
                        <span className="label">Price per meter</span>
                        <h2 className="price-value">Rs. {fabric.price_per_meter.toFixed(2)}</h2>
                    </div>

                    <div className="attributes-grid">
                        <div className="attr-item">
                            <span className="attr-label">Material</span>
                            <span className="attr-value">{fabric.material_type}</span>
                        </div>
                        <div className="attr-item">
                            <span className="attr-label">Design</span>
                            <span className="attr-value">{fabric.design}</span>
                        </div>
                        <div className="attr-item">
                            <span className="attr-label">Width</span>
                            <span className="attr-value">{fabric.width || 'Standard'}</span>
                        </div>
                        <div className="attr-item">
                            <span className="attr-label">Availability</span>
                            <span className={`attr-value ${fabric.stock_quantity > 0 ? 'in-stock-text' : 'out-of-stock-text'}`}>
                                {fabric.stock_quantity > 0 ? `In Stock – ${fabric.stock_quantity}m` : 'Currenty Out of Stock'}
                            </span>
                        </div>
                    </div>

                    {/* Color Swatch Section */}
                    {variants.length > 0 && (
                        <div className="color-selection-section">
                            <h3 className="section-title">Available Colors & Stock</h3>
                            <div className="swatch-grid">
                                {variants.map((variant) => {
                                    const isActive = variant.fabric_id === fabric.fabric_id;
                                    const outOfStock = variant.stock_quantity <= 0;
                                    return (
                                        <button
                                            key={variant.fabric_id}
                                            className={`swatch-item ${isActive ? 'active' : ''} ${outOfStock ? 'swatch-oos' : ''}`}
                                            onClick={() => !outOfStock && navigate(`/customer/fabric/${variant.fabric_id}`)}
                                            title={`${variant.color} — ${variant.stock_quantity}m available`}
                                            disabled={outOfStock}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '8px', background: 'transparent', border: isActive ? '2px solid #001a66' : '2px solid transparent', borderRadius: '10px' }}
                                        >
                                            <span
                                                className="swatch-dot"
                                                style={{
                                                    backgroundColor: variant.color || '#cccccc',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    display: 'block',
                                                    border: '1px solid rgba(0,0,0,0.1)',
                                                    opacity: outOfStock ? 0.35 : 1,
                                                    position: 'relative'
                                                }}
                                            >
                                                {isActive && (
                                                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700, textShadow: '0 0 3px rgba(0,0,0,0.7)' }}>✓</span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="selected-color-name">
                                Selected: <strong>{fabric.color && fabric.color.startsWith('#') ? 'Custom Tone' : fabric.color}</strong>
                                {' '}— <span style={{ color: fabric.stock_quantity > 0 ? '#1a7a4a' : '#c1121f', fontWeight: 600 }}>
                                    {fabric.stock_quantity > 0 ? `${fabric.stock_quantity}m in stock` : 'Out of stock'}
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Restock Date Section */}
                    {fabric.restock_date && fabric.stock_quantity <= (fabric.reorder_level || 50) && (
                        <div className="restock-alert-box">
                            <span className="icon">📅</span>
                            <div className="text">
                                <strong>Expected Restock</strong>
                                <p>{new Date(fabric.restock_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="purchase-controls">
                        {fabric.stock_quantity > 0 ? (
                            <>
                                <div className="qty-selector">
                                    <label htmlFor="qty">Quantity (meters)</label>
                                    <div className="qty-input-wrapper">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                        <input
                                            id="qty"
                                            type="number"
                                            min="1"
                                            max={fabric.stock_quantity}
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        />
                                        <button onClick={() => setQuantity(q => Math.min(fabric.stock_quantity, q + 1))}>+</button>
                                    </div>
                                </div>
                                <button
                                    className="btn-add-primary"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                >
                                    {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                                </button>
                            </>
                        ) : (
                            <button className="btn-disabled" disabled>Currently Unavailable</button>
                        )}
                    </div>

                    {cartMessage.text && (
                        <div className={`message-banner ${cartMessage.type}`}>
                            {cartMessage.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FabricDetails;
