import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../utils/auth.js";

export default function StockAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics`);
      const data = await response.json();

      if (response.ok) {
        // Filter for LOW or OUT_OF_STOCK
        const lowStock = (data.fabrics || []).filter(f => f.stock_status === 'LOW' || f.stock_status === 'OUT_OF_STOCK' || parseFloat(f.stock_quantity) <= parseFloat(f.reorder_level));
        setAlerts(lowStock);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading alerts...</div>;
  }

  return (
    <div
      style={{ background: "#ffffff", padding: "20px", borderRadius: "10px" }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "10px", color: "#001a66" }}>
        Stock Alerts
      </h1>
      <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "15px" }}>
        Monitor items that have fallen below their minimum stock level.
      </p>

      {alerts.length > 0 ? (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fee2e2",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px",
            boxShadow: "0 4px 12px rgba(220, 53, 69, 0.05)"
          }}
        >
          <h3 style={{ color: "#dc2626", fontSize: "18px", margin: "0 0 8px 0", fontWeight: "700" }}>
            ⚠️ Attention Needed
          </h3>
          <p style={{ fontSize: "15px", color: "#991b1b", margin: 0, fontWeight: "500" }}>
            {alerts.length} item{alerts.length !== 1 ? "s" : ""} require reordering.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #dcfce7",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.05)"
          }}
        >
          <h3 style={{ color: "#16a34a", fontSize: "18px", margin: "0 0 8px 0", fontWeight: "700" }}>
            ✅ All Clear
          </h3>
          <p style={{ fontSize: "15px", color: "#166534", margin: 0, fontWeight: "500" }}>
            All fabrics have adequate stock levels.
          </p>
        </div>
      )}

      {alerts.length > 0 && (
        <div style={{ overflowX: "auto", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em" }}>Fabric Name</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em" }}>Fabric ID</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em" }}>Current Stock</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em" }}>Reorder Level</th>
                <th style={{ textAlign: "left", padding: "16px", color: "#475569", fontWeight: "700", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.05em" }}>Expected Restock</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((fabric) => (
                <tr key={fabric.fabric_id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    {fabric.name}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      color: "#64748b",
                    }}
                  >
                    #{fabric.fabric_id}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                    }}
                  >
                    <span style={{
                      color: "#dc2626",
                      fontWeight: "700",
                      background: "rgba(220, 53, 69, 0.1)",
                      padding: "4px 8px",
                      borderRadius: "6px"
                    }}>
                      {fabric.stock_quantity} m
                    </span>
                  </td>
                  <td
                    style={{ padding: "16px", color: "#475569", fontWeight: "500" }}
                  >
                    {fabric.reorder_level} m
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      color: parseFloat(fabric.stock_quantity) === 0 ? "#dc2626" : "#059669",
                      fontWeight: "600"
                    }}
                  >
                    {fabric.restock_date ? new Date(fabric.restock_date).toLocaleDateString() : 'Not Set'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
