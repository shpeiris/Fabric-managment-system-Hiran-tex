import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../../../utils/auth.js';
import './FabricDetails.css';

const FabricDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [fabric, setFabric] = useState(null);
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
            const response = await apiCall(`http://localhost:5000/api/fabrics/${id}`);
            const data = await response.json();

            if (response.ok) {
                // Ensure price is a number
                const fabricData = data.fabric;
                fabricData.price_per_meter = parseFloat(fabricData.price_per_meter);
                setFabric(fabricData);
                setError(null);
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
            const response = await apiCall('http://localhost:5000/api/cart', {
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
                                    ? `http://localhost:5000/${fabric.image_url}` 
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
                            <span className="attr-label">Color</span>
                            <span className="attr-value">{fabric.color}</span>
                        </div>
                        <div className="attr-item">
                            <span className="attr-label">Design</span>
                            <span className="attr-value">{fabric.design}</span>
                        </div>
                        <div className="attr-item">
                            <span className="attr-label">Availability</span>
                            <span className={`attr-value ${fabric.stock_quantity > 0 ? 'in-stock-text' : 'out-of-stock-text'}`}>
                                {fabric.stock_quantity > 0 ? `In Stock – ${fabric.stock_quantity}m` : 'Currenty Out of Stock'}
                            </span>
                        </div>
                    </div>

                    {/* Restock Date Section */}
                    {fabric.restock_date && fabric.stock_quantity <= (fabric.reorder_level || 50) && (
                        <div className="restock-alert-box">
                            <span className="icon">📅</span>
                            <div className="text">
                                <strong>Expected Restock</strong>
                                <p>{new Date(fabric.restock_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
