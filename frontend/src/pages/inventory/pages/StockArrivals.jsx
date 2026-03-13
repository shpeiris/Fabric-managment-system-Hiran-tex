import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiCall } from "../../../utils/auth.js";
import "./InventoryDashboard.css";

export default function StockArrivals() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [arrivals, setArrivals] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fabric_id: "",
    supplier_id: "",
    quantity: "",
    supply_unit_price: "",
    arrival_date: new Date().toISOString().split('T')[0]
  });

  const [fabricSearch, setFabricSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showFabricDropdown, setShowFabricDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Calculate total value automatically
  const totalValue = formData.quantity && formData.supply_unit_price ?
    parseFloat(formData.quantity) * parseFloat(formData.supply_unit_price) : 0;

  useEffect(() => {
    fetchInitialData();
    
    // Check for incoming fabric state from Alerts
    if (location.state && location.state.fabric_id) {
      setFormData(prev => ({ ...prev, fabric_id: location.state.fabric_id }));
      setFabricSearch(`${location.state.fabric_name} (${location.state.material_type || ''})`);
      setShowModal(true);
      
      // Clear location state to prevent modal reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [arrivalsRes, fabricsRes, suppliersRes] = await Promise.all([
        apiCall('http://localhost:5000/api/inventory/stock-arrivals'),
        apiCall('http://localhost:5000/api/inventory/fabrics'),
        apiCall('http://localhost:5000/api/inventory/suppliers')
      ]);

      const [arrivalsData, fabricsData, suppliersData] = await Promise.all([
        arrivalsRes.json(),
        fabricsRes.json(),
        suppliersRes.json()
      ]);

      if (arrivalsRes.ok) setArrivals(arrivalsData.arrivals || []);
      if (fabricsRes.ok) setFabrics(fabricsData.fabrics || []);
      if (suppliersRes.ok) setSuppliers(suppliersData.suppliers || []);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fabric_id || !formData.supplier_id || !formData.quantity || !formData.supply_unit_price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiCall('http://localhost:5000/api/inventory/stock-arrivals', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          supply_unit_price: parseFloat(formData.supply_unit_price),
          total_value: totalValue
        })
      });

      const data = await response.json();

        if (response.ok) {
            alert("Stock arrival recorded successfully!");
            setShowModal(false);
            setFormData({
                fabric_id: "",
                supplier_id: "",
                quantity: "",
                supply_unit_price: "",
                arrival_date: new Date().toISOString().split('T')[0]
            });
            setFabricSearch("");
            setSupplierSearch("");
            fetchInitialData(); // Refresh list
        } else {
        alert(data.error || "Failed to record arrival");
      }
    } catch (err) {
      console.error('Error recording arrival:', err);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading arrivals...</div>;
  }

  const totalMeters = arrivals.reduce((sum, a) => sum + parseFloat(a.quantity), 0);
  const totalHistoryValue = arrivals.reduce((sum, a) => sum + parseFloat(a.total_value), 0);
  const recentArrivals = arrivals.filter(a => {
    const arrivalDate = new Date(a.arrival_date);
    const today = new Date();
    return (today - arrivalDate) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  return (
    <div style={{ background: "#ffffff", padding: "20px", borderRadius: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px", color: "#001a66", fontWeight: "800", letterSpacing: "-0.5px" }}>Stock Arrivals</h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Record and track incoming fabric stock from suppliers.
          </p>
        </div>
        <button
          style={{
            background: "#7cff00",
            color: "#001a66",
            border: "none",
            padding: "12px 28px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "800",
            fontSize: "14px",
            transition: "all 0.3s",
            boxShadow: "0 4px 15px rgba(124, 255, 0, 0.2)"
          }}
          onClick={() => setShowModal(true)}
        >
          + Record New Arrival
        </button>
      </div>

      {/* Quick Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "35px" }}>
        <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "5px" }}>Recent Arrivals (7d)</div>
          <div style={{ fontSize: "24px", color: "#001a66", fontWeight: "800" }}>{recentArrivals}</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "5px" }}>Total Meters Received</div>
          <div style={{ fontSize: "24px", color: "#001a66", fontWeight: "800" }}>{totalMeters.toFixed(1)} m</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "5px" }}>Total Supply Value</div>
          <div style={{ fontSize: "24px", color: "#059669", fontWeight: "800" }}>Rs. {totalHistoryValue.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,26,102,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Arrival ID</th>
              <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Date</th>
              <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Fabric Details</th>
              <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Supplier</th>
              <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Quantity</th>
              <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Total Value</th>
              <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Received By</th>
              <th style={{ textAlign: "right", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {arrivals.length > 0 ? (
              arrivals.map((arrival) => (
                <tr key={arrival.arrival_id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px", color: "#001a66", fontWeight: "700" }}>#ARV-{arrival.arrival_id.toString().padStart(3, '0')}</td>
                  <td style={{ padding: "16px", color: "#64748b" }}>
                    {new Date(arrival.arrival_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "700", color: "#1e293b" }}>{arrival.fabric_name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{arrival.material_type}</div>
                  </td>
                  <td style={{ padding: "16px", color: "#001a66", fontWeight: "600" }}>
                    {arrival.supplier_name}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ color: "#334155", fontWeight: "700" }}>{arrival.quantity} m</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>Rs. {Number(arrival.supply_unit_price).toFixed(2)}/m</div>
                  </td>
                  <td style={{ padding: "16px", color: "#059669", fontWeight: "800" }}>
                    Rs. {Number(arrival.total_value).toLocaleString()}
                  </td>
                  <td style={{ padding: "16px", color: "#64748b" }}>
                    {arrival.received_by_name || "System/Admin"}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button style={{ background: "transparent", border: "1px solid #e2e8f0", color: "#64748b", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Details</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  No recent stock arrivals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Arrival Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white", padding: "35px", borderRadius: "24px",
              width: "550px", maxWidth: "90%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(0, 26, 102, 0.1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: "#001a66", marginBottom: "25px", fontWeight: "800", textAlign: "center" }}>Record Stock Arrival</h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: "20px" }}>
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Fabric Item *</label>
                  <input
                    type="text"
                    value={fabricSearch}
                    onChange={(e) => {
                      setFabricSearch(e.target.value);
                      setShowFabricDropdown(true);
                    }}
                    onFocus={() => setShowFabricDropdown(true)}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none" }}
                  />
                  {showFabricDropdown && fabricSearch && (
                    <div className="search-results-dropdown">
                      {fabrics
                        .filter(f => f.name.toLowerCase().includes(fabricSearch.toLowerCase()) || f.material_type.toLowerCase().includes(fabricSearch.toLowerCase()))
                        .map(f => (
                          <div 
                            key={f.fabric_id} 
                            className="search-item"
                            onClick={() => {
                              setFormData({...formData, fabric_id: f.fabric_id});
                              setFabricSearch(`${f.name} (${f.material_type})`);
                              setShowFabricDropdown(false);
                            }}
                          >
                            {f.name} ({f.material_type})
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Supplier *</label>
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setShowSupplierDropdown(true);
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    required
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none" }}
                  />
                  {showSupplierDropdown && supplierSearch && (
                    <div className="search-results-dropdown">
                      {suppliers
                        .filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))
                        .map(s => (
                          <div 
                            key={s.supplier_id} 
                            className="search-item"
                            onClick={() => {
                              setFormData({...formData, supplier_id: s.supplier_id});
                              setSupplierSearch(s.name);
                              setShowSupplierDropdown(false);
                            }}
                          >
                            {s.name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Quantity (m) *</label>
                    <input
                      type="number"
                      name="quantity"
                      step="0.01"
                      required
                      placeholder="e.g. 50.0"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Unit Price (Rs) *</label>
                    <input
                      type="number"
                      name="supply_unit_price"
                      step="0.01"
                      required
                      placeholder="e.g. 1200.0"
                      value={formData.supply_unit_price}
                      onChange={handleInputChange}
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Arrival Date</label>
                  <input
                    type="date"
                    name="arrival_date"
                    value={formData.arrival_date}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #e2e8f0", outline: "none" }}
                  />
                </div>

                {/* Total Value Display */}
                {totalValue > 0 && (
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "5px" }}>Total Value</label>
                    <div style={{ fontSize: "24px", fontWeight: "800", color: "#059669" }}>Rs. {totalValue.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "15px", marginTop: "35px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#f1f5f9", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                    background: submitting ? "#94a3b8" : "#001a66",
                    color: "white", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer"
                  }}
                >
                  {submitting ? "Recording..." : "Record Arrival"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
