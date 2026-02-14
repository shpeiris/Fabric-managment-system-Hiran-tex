import { useState } from "react";

export default function Transactions() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const transactions = [
    {
      id: "TXN001",
      date: "2024-01-20",
      type: "Stock In",
      fabric: "Cotton Blend",
      quantity: "+200",
      value: "Rs. 45,000",
      user: "Admin",
    },
    {
      id: "TXN002",
      date: "2024-01-20",
      type: "Stock Out",
      fabric: "Silk Fabric",
      quantity: "-50",
      value: "Rs. 32,500",
      user: "Sales Team",
    },
    {
      id: "TXN003",
      date: "2024-01-19",
      type: "Stock In",
      fabric: "Denim",
      quantity: "+150",
      value: "Rs. 52,000",
      user: "Inventory Manager",
    },
    {
      id: "TXN004",
      date: "2024-01-19",
      type: "Adjustment",
      fabric: "Polyester Mix",
      quantity: "-10",
      value: "Rs. 1,800",
      user: "Inventory Manager",
    },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "Stock In":
        return "#16a34a";
      case "Stock Out":
        return "#ef4444";
      case "Adjustment":
        return "#f59e0b";
      case "Transfer":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <div style={{ background: "#ffffff", padding: "20px", borderRadius: "10px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "10px", color: "#333" }}>Inventory Transactions</h1>
      <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "15px" }}>
        View and manage all inventory transactions including stock-in, stock-out, and adjustments.
      </p>

      <button
        style={{
          background: "#22c55e",
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        onClick={() => setShowModal(true)}
      >
        + Add Transaction
      </button>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div
          style={{
            flex: 1,
            background: "#f8fafc",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "5px" }}>Today's Stock In</p>
          <p style={{ fontSize: "20px", fontWeight: "bold", color: "#16a34a" }}>+350 units</p>
        </div>
        <div
          style={{
            flex: 1,
            background: "#f8fafc",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "5px" }}>Today's Stock Out</p>
          <p style={{ fontSize: "20px", fontWeight: "bold", color: "#ef4444" }}>-60 units</p>
        </div>
        <div
          style={{
            flex: 1,
            background: "#f8fafc",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "5px" }}>Total Transactions Today</p>
          <p style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>4</p>
        </div>
      </div>

      <h3 style={{ marginTop: "10px", marginBottom: "10px" }}>Transaction History</h3>

      <div style={{ display: "flex", gap: "20px", fontSize: "14px", marginBottom: "15px" }}>
        <span
          style={{
            cursor: "pointer",
            color: "#2563eb",
            fontWeight: activeTab === "all" ? "bold" : "normal",
            borderBottom: activeTab === "all" ? "2px solid #2563eb" : "none",
          }}
          onClick={() => setActiveTab("all")}
        >
          All Transactions
        </span>
        <span
          style={{
            cursor: "pointer",
            color: "#2563eb",
            fontWeight: activeTab === "stockin" ? "bold" : "normal",
            borderBottom: activeTab === "stockin" ? "2px solid #2563eb" : "none",
          }}
          onClick={() => setActiveTab("stockin")}
        >
          Stock In
        </span>
        <span
          style={{
            cursor: "pointer",
            color: "#2563eb",
            fontWeight: activeTab === "stockout" ? "bold" : "normal",
            borderBottom: activeTab === "stockout" ? "2px solid #2563eb" : "none",
          }}
          onClick={() => setActiveTab("stockout")}
        >
          Stock Out
        </span>
        <span
          style={{
            cursor: "pointer",
            color: "#2563eb",
            fontWeight: activeTab === "adjustment" ? "bold" : "normal",
            borderBottom: activeTab === "adjustment" ? "2px solid #2563eb" : "none",
          }}
          onClick={() => setActiveTab("adjustment")}
        >
          Adjustments
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            <th style={{ textAlign: "left", padding: "12px" }}>Transaction ID</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Date</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Type</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Fabric</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Quantity</th>
            <th style={{ textAlign: "left", padding: "12px" }}>Value</th>
            <th style={{ textAlign: "left", padding: "12px" }}>User</th>
            <th style={{ textAlign: "right", padding: "12px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>{transaction.id}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#6c757d" }}>
                {transaction.date}
              </td>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  color: getTypeColor(transaction.type),
                  fontWeight: "500",
                }}
              >
                {transaction.type}
              </td>
              <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>{transaction.fabric}</td>
              <td
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #e5e7eb",
                  color: transaction.quantity.startsWith("+") ? "#16a34a" : "#ef4444",
                  fontWeight: "500",
                }}
              >
                {transaction.quantity}
              </td>
              <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>{transaction.value}</td>
              <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb", color: "#007bff" }}>
                {transaction.user}
              </td>
              <td style={{ padding: "12px", borderBottom: "1px solid #e5e7eb", textAlign: "right" }}>
                <span style={{ color: "#2563eb", cursor: "pointer", marginRight: "15px" }}>View</span>
                <span style={{ color: "#6b7280", cursor: "pointer" }}>Print</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Transaction Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "500px",
              maxWidth: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "20px" }}>Add New Transaction</h2>
            <form>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Transaction Type</label>
                <select
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                >
                  <option>Stock In</option>
                  <option>Stock Out</option>
                  <option>Adjustment</option>
                  <option>Transfer</option>
                </select>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Fabric</label>
                <select
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                >
                  <option>Select Fabric</option>
                  <option>Cotton Blend</option>
                  <option>Silk Fabric</option>
                  <option>Denim</option>
                  <option>Polyester Mix</option>
                </select>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Quantity</label>
                <input
                  type="number"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Notes</label>
                <textarea
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                  placeholder="Additional notes..."
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  style={{
                    padding: "8px 16px",
                    background: "#e5e7eb",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "8px 16px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
