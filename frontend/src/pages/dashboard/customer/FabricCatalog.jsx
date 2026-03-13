import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FabricCatalog.css";

const FabricCatalog = () => {
  const navigate = useNavigate();
  // Hardcoded fabric data
  const [fabrics, setFabrics] = useState([
    {
      id: "FAB101",
      fabric_id: 101,
      name: "Premium Cotton Blue",
      price: 450.0,
      category: "cotton",
      material_type: "Cotton",
      color: "Blue",
      design: "Solid",
      image: "https://via.placeholder.com/300x200?text=Cotton+Blue",
      stock: 120,
      restock_level: 50,
      status: "in-stock",
      created_at: new Date().toISOString(),
    },
    {
      id: "FAB102",
      fabric_id: 102,
      name: "Elegant Silk Red",
      price: 1200.0,
      category: "silk",
      material_type: "Silk",
      color: "Red",
      design: "Patterned",
      image: "https://via.placeholder.com/300x200?text=Silk+Red",
      stock: 15, // Low stock
      restock_level: 20,
      status: "low-stock",
      restock_date: "2024-03-15",
      reorderDate: "Mar 15, 2024",
      created_at: new Date().toISOString(),
    },
    {
      id: "FAB103",
      fabric_id: 103,
      name: "Pure Linen White",
      price: 850.0,
      category: "linen",
      material_type: "Linen",
      color: "White",
      design: "Solid",
      image: "https://via.placeholder.com/300x200?text=Linen+White",
      stock: 0, // Out of stock
      restock_level: 30,
      status: "out-of-stock",
      restock_date: "2024-02-28",
      reorderDate: "Feb 28, 2024",
      created_at: new Date().toISOString(),
    },
    {
      id: "FAB104",
      fabric_id: 104,
      name: "Wool Blend Grey",
      price: 950.0,
      category: "wool",
      material_type: "Wool",
      color: "Grey",
      design: "Textured",
      image: "https://via.placeholder.com/300x200?text=Wool+Grey",
      stock: 45,
      restock_level: 50,
      status: "low-stock",
      restock_date: "2024-03-10",
      reorderDate: "Mar 10, 2024",
      created_at: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartLoading, setCartLoading] = useState({});
  const [cartSuccess, setCartSuccess] = useState({});

  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
  });

  // Removed useEffect fetchFabrics

  const getStockStatus = (stock, restockLevel) => {
    if (!stock || stock === 0) return "out-of-stock";
    if (stock <= restockLevel) return "low-stock";
    return "in-stock";
  };

  const addToCart = async (fabric) => {
    if (fabric.status === "out-of-stock") {
      alert("This fabric is currently out of stock");
      return;
    }

    setCartLoading((prev) => ({ ...prev, [fabric.fabric_id]: true }));

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setCartSuccess((prev) => ({ ...prev, [fabric.fabric_id]: true }));
      setTimeout(() => {
        setCartSuccess((prev) => ({ ...prev, [fabric.fabric_id]: false }));
      }, 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add to cart");
    } finally {
      setCartLoading((prev) => ({ ...prev, [fabric.fabric_id]: false }));
    }
  };

  // Filter logic
  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesCategory =
      filters.category === "all" || fabric.category === filters.category;
    const matchesSearch =
      fabric.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      fabric.id.toLowerCase().includes(filters.search.toLowerCase()) ||
      (fabric.material_type &&
        fabric.material_type
          .toLowerCase()
          .includes(filters.search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "in-stock":
        return "status-in-stock";
      case "low-stock":
        return "status-low-stock";
      case "out-of-stock":
        return "status-out-of-stock";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="fabric-catalog">
        <div className="catalog-header">
          <h1>Browse Fabrics</h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
          }}
        >
          <div>Loading fabrics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fabric-catalog">
        <div className="catalog-header">
          <h1>Browse Fabrics</h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            color: "red",
          }}
        >
          <div>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fabric-catalog">
      <div className="catalog-header">
        <h1>Browse Fabrics</h1>
        <div className="view-toggles">
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            Grid
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List View"
          >
            List
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrapper">
          <span className="search-icon-placeholder">🔍</span>
          <input
            type="text"
            placeholder="Search fabrics by name or ID..."
            className="search-input"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="category-select"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="all">All Categories</option>
          <option value="cotton">Cotton</option>
          <option value="silk">Silk</option>
          <option value="wool">Wool</option>
          <option value="linen">Linen</option>
          <option value="synthetic">Synthetic</option>
          <option value="viscose">Viscose</option>
        </select>
      </div>

      {viewMode === "list" ? (
        // Table View
        <div className="fabric-table-container">
          <div className="overflow-x-auto">
            <table className="fabric-table">
              <thead>
                <tr>
                  <th>Fabric</th>
                  <th>Category</th>
                  <th>Price (per m)</th>
                  <th>Status</th>
                  <th>Re-order Date</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFabrics.map((fabric) => (
                  <tr key={fabric.id}>
                    <td>
                      <div className="table-fabric-info">
                        <span className="table-fabric-name">{fabric.name}</span>
                        <span className="table-fabric-id">{fabric.id}</span>
                      </div>
                    </td>
                    <td className="capitalize">{fabric.category}</td>
                    <td style={{ fontWeight: "600", color: "#001a66" }}>
                      Rs. {fabric.price}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(fabric.status)}`}
                        style={{
                          position: "static",
                          padding: "4px 8px",
                          fontSize: "11px",
                        }}
                      >
                        {fabric.status.replace("-", " ")}
                      </span>
                      <div
                        style={{
                          fontSize: "12px",
                          color: fabric.stock < 20 ? "#ef4444" : "#64748b",
                          marginTop: "4px",
                          fontWeight: "500",
                        }}
                      >
                        Stock: {fabric.stock}m
                      </div>
                    </td>
                    <td>
                      {fabric.status === "low-stock" ||
                        fabric.status === "out-of-stock" ? (
                        <span style={{ color: "#ef4444", fontWeight: "500" }}>
                          {fabric.reorderDate}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className={`btn-add-cart ${fabric.status === "out-of-stock" ? "disabled" : ""}`}
                        onClick={() => addToCart(fabric)}
                        disabled={
                          cartLoading[fabric.fabric_id] ||
                          fabric.status === "out-of-stock"
                        }
                      >
                        {cartLoading[fabric.fabric_id]
                          ? "..."
                          : cartSuccess[fabric.fabric_id]
                            ? "✓ Added"
                            : fabric.status === "out-of-stock"
                              ? "Out of Stock"
                              : "Add to Cart"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFabrics.length === 0 && (
              <div className="no-results">
                <p>No fabrics found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Grid View
        <>
          <div className="fabric-grid">
            {filteredFabrics.map((fabric) => (
              <div key={fabric.id} className="fabric-card">
                <div className="card-header-status">
                  <span
                    className={`status-badge ${getStatusClass(fabric.status)}`}
                  >
                    {fabric.status.replace("-", " ")}
                  </span>
                </div>
                <div className="card-content">
                  <span className="fabric-category">{fabric.category}</span>
                  <h3 className="fabric-name">{fabric.name}</h3>
                  <div className="fabric-price">Rs. {fabric.price}</div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      marginBottom: "10px",
                    }}
                  >
                    Stock:{" "}
                    <strong
                      style={{
                        color: fabric.stock < 20 ? "#ef4444" : "#059669",
                      }}
                    >
                      {fabric.stock}m
                    </strong>
                  </div>

                  <div className="card-footer">
                    {(fabric.status === "low-stock" ||
                      fabric.status === "out-of-stock") && (
                        <div
                          className="restock-info"
                          style={{
                            background:
                              fabric.status === "out-of-stock"
                                ? "#fee2e2"
                                : "#fef3c7",
                            color:
                              fabric.status === "out-of-stock"
                                ? "#dc2626"
                                : "#d97706",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            marginBottom: "8px",
                            textAlign: "center",
                          }}
                        >
                          📅 Expected Restock: {fabric.reorderDate ? new Date(fabric.reorderDate).toLocaleDateString() : "TBA"}
                        </div>
                      )}
                    <button
                      className={`btn-add ${fabric.status === "out-of-stock" ? "disabled" : ""} ${cartSuccess[fabric.fabric_id] ? "success" : ""}`}
                      onClick={() => addToCart(fabric)}

                      disabled={
                        cartLoading[fabric.fabric_id] ||
                        fabric.status === "out-of-stock"
                      }
                    >
                      {cartLoading[fabric.fabric_id]
                        ? "Adding..."
                        : cartSuccess[fabric.fabric_id]
                          ? "✓ Added to Cart"
                          : fabric.status === "out-of-stock"
                            ? "Out of Stock"
                            : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredFabrics.length === 0 && (
            <div className="no-results">
              <p>No fabrics found matching your search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FabricCatalog;
