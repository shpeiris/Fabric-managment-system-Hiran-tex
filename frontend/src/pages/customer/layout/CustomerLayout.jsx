import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, removeUser, apiCall } from "../../../utils/auth.js";
import "./CustomerLayout.css";

export default function CustomerLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);

  const handleLogout = async () => {
    try {
      await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/logout`, {
        method: 'POST'
      });
      removeUser();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      removeUser();
      navigate("/login");
    }
  };

  return (
    <div className="customer-container">
      {/* Sidebar */}
      <aside className="customer-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Hiran Fabrics</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/customer/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/customer/browse" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Browse Fabrics
          </NavLink>
          <NavLink to="/customer/cart" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Shopping Cart
          </NavLink>
          <NavLink to="/customer/orders" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            My Orders
          </NavLink>
          <NavLink to="/customer/payments" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Payments
          </NavLink>
          <NavLink to="/customer/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="customer-main">
        {/* Top Header */}
        <header className="customer-header">
          <div className="header-search">
            <input type="text" placeholder="Search fabrics..." />
          </div>

          <div className="header-profile">
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'Customer'}</span>
              <span className="user-role">{user?.role || 'CUSTOMER'}</span>
            </div>
            <div className="user-avatar">
              {(user?.full_name || 'C').charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="customer-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
