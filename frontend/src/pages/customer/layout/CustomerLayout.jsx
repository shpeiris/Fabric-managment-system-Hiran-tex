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
      await apiCall('http://localhost:5000/logout', {
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
          <span className="sidebar-logo-icon">🏠</span>
          <span className="sidebar-title">Hiran Fabrics</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/customer/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/customer/browse" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-icon">🧵</span>
            Browse Fabrics
          </NavLink>
          <NavLink to="/customer/cart" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-icon">🛒</span>
            Shopping Cart
          </NavLink>
          <NavLink to="/customer/orders" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-icon">📦</span>
            My Orders
          </NavLink>
          <NavLink to="/customer/payments" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-icon">💳</span>
            Payments
          </NavLink>
          <NavLink to="/customer/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <span className="nav-icon">👤</span>
            Profile
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="customer-main">
        {/* Top Header */}
        <header className="customer-header">
          <div className="header-search">
            <span className="search-icon">🔍</span>
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
