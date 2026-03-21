import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      style={{
        width: "240px",
        background: "#0a1f44",
        color: "white",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }}
    >
      {/* Header */}
      <div style={{ padding: "30px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: "18px", 
          fontWeight: "700", 
          color: "#7cff00",
          letterSpacing: "0.5px"
        }}>
          Hiran Fabrics
        </h3>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "20px 0" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <Link 
              to="/admin/dashboard" 
              style={{
                ...linkStyle,
                background: isActive("/admin/dashboard") ? "rgba(124, 255, 0, 0.1)" : "transparent",
                borderLeft: isActive("/admin/dashboard") ? "4px solid #7cff00" : "4px solid transparent"
              }}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/users" 
              style={{
                ...linkStyle,
                background: isActive("/admin/users") ? "rgba(124, 255, 0, 0.1)" : "transparent",
                borderLeft: isActive("/admin/users") ? "4px solid #7cff00" : "4px solid transparent"
              }}
            >
              User Management
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/suppliers" 
              style={{
                ...linkStyle,
                background: isActive("/admin/suppliers") ? "rgba(124, 255, 0, 0.1)" : "transparent",
                borderLeft: isActive("/admin/suppliers") ? "4px solid #7cff00" : "4px solid transparent"
              }}
            >
              Supplier Management
            </Link>
          </li>
          <li>
            <Link 
              to="/admin/reports" 
              style={{
                ...linkStyle,
                background: isActive("/admin/reports") ? "rgba(124, 255, 0, 0.1)" : "transparent",
                borderLeft: isActive("/admin/reports") ? "4px solid #7cff00" : "4px solid transparent"
              }}
            >
              Reports and Analytics
            </Link>
          </li>
        </ul>
      </div>

    </div>
  );
}

const linkStyle = {
  display: "block",
  color: "white",
  padding: "12px 20px",
  textDecoration: "none",
  fontSize: "14px",
  transition: "all 0.2s ease"
};
