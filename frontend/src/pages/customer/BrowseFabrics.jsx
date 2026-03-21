import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../utils/auth.js';
import './BrowseFabrics.css';

const BrowseFabrics = () => {
    const navigate = useNavigate();
    const [fabrics, setFabrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [addingToCartId, setAddingToCartId] = useState(null);

    useEffect(() => {
        fetchFabrics();
    }, []);

    const fetchFabrics = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/fabrics`);
            const data = await response.json();

            if (response.ok) {
                setFabrics(data.fabrics || []);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch fabrics');
            }
        } catch (err) {
            console.error('Error fetching fabrics:', err);
            setError('Could not connect to the server');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (fabricId) => {
        try {
            setAddingToCartId(fabricId);
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fabric_id: fabricId, quantity: 1 })
            });

            if (response.ok) {
                alert('Added to cart!');
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to add to cart');
            }
        } catch (err) {
            console.error('Cart error:', err);
        } finally {
            setAddingToCartId(null);
        }
    };

    const categories = ['All', ...new Set(fabrics.map(f => f.material_type).filter(Boolean))];

    const filteredFabrics = fabrics.filter(fabric => {
        const matchesSearch = fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fabric.material_type && fabric.material_type.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || fabric.material_type === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Group fabrics by name — one card per fabric name
    const groupedFabrics = Object.values(
        filteredFabrics.reduce((acc, fabric) => {
            if (!acc[fabric.name]) {
                acc[fabric.name] = { ...fabric, variants: [fabric] };
            } else {
                acc[fabric.name].variants.push(fabric);
                // Prefer an in-stock variant as the representative
                if (acc[fabric.name].stock_quantity <= 0 && fabric.stock_quantity > 0) {
                    const variants = acc[fabric.name].variants;
                    acc[fabric.name] = { ...fabric, variants };
                }
            }
            return acc;
        }, {})
    );

    if (loading) {
        return (
            <div className="browse-container">
                <div className="loading-state">Loading premium fabrics...</div>
            </div>
        );
    }

    return (
        <div className="browse-container">
            <header className="browse-header">
                <h1>Browse Fabrics</h1>
                <p className="browse-subtitle">Discover premium quality fabrics for your needs</p>
            </header>

            <div className="filters-bar">
                <div className="filter-group">
                    <input
                        type="text"
                        placeholder="Search fabrics..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        className="category-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="products-grid">
                {groupedFabrics.map(fabric => (
                    <div key={fabric.fabric_id} className="product-card">
                        <div className="product-image-container">
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
                                className="product-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/src/assets/Fabrics/fabric-collage.jpg';
                                }}
                            />
                        </div>
                        <div className="product-details">
                            <div className="product-header-row">
                                <span className="product-category">{fabric.material_type}</span>
                                <span className="stock-tag-inline">
                                    {fabric.width ? `${fabric.width} | ` : ''}{fabric.stock_quantity > 0 ? `${fabric.stock_quantity}m` : 'Out of Stock'}
                                </span>
                            </div>
                            <h3 className="product-name">{fabric.name}</h3>
                            <div className="product-price">Rs. {parseFloat(fabric.price_per_meter).toFixed(2)}</div>

                            {/* Color variant dots */}
                            {fabric.variants && fabric.variants.length > 0 && (
                                <div className="color-dots-row">
                                    {fabric.variants.map(v => (
                                        <span
                                            key={v.fabric_id}
                                            className="color-dot"
                                            style={{
                                                backgroundColor: v.color || '#cccccc',
                                                border: v.fabric_id === fabric.fabric_id
                                                    ? '2px solid #001a66'
                                                    : '2px solid #ddd'
                                            }}
                                            title={v.color || 'Color'}
                                        />
                                    ))}
                                    {fabric.variants.length > 1 && (
                                        <span className="color-count-hint">
                                            {fabric.variants.length} colors
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Restock Date Info */}
                            {fabric.stock_quantity <= (fabric.reorder_level || 50) && fabric.restock_date && (
                                <div className="restock-info-banner">
                                    Restocking on: {new Date(fabric.restock_date).toLocaleDateString()}
                                </div>
                            )}

                            <div className="actions">
                                <button
                                    className="btn-add-cart"
                                    onClick={() => handleAddToCart(fabric.fabric_id)}
                                    disabled={fabric.stock_quantity <= 0 || addingToCartId === fabric.fabric_id}
                                >
                                    {addingToCartId === fabric.fabric_id ? 'Adding...' : 'Add to Cart'}
                                </button>
                                <button
                                    className="btn-details"
                                    onClick={() => navigate(`/customer/fabric/${fabric.fabric_id}`)}
                                    title="View Details & Select Color"
                                >
                                    More Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {groupedFabrics.length === 0 && !loading && (
                <div className="no-results">No fabrics found matching your criteria.</div>
            )}
        </div>
    );
};

export default BrowseFabrics;
