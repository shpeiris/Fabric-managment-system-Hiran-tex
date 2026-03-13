import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, removeUser, apiCall } from "../../../utils/auth.js";
import "./AdminLayout.css";

export default function AdminLayout() {
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
      // Even if logout fails, clear local data and redirect
      removeUser();
      navigate("/login");
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title" style={{ color: '#7cff00' }}>Hiran Fabrics</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            User Management
          </NavLink>
          <NavLink to="/admin/fabrics" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Fabric Management
          </NavLink>
          <NavLink to="/admin/suppliers" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Suppliers
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            Reports
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-search">
            <input type="text" placeholder="Search..." />
          </div>

          <div className="header-profile">
            <div className="user-info">
              <span className="user-name">{user?.full_name || 'Administrator'}</span>
              <span className="user-role">{user?.role || 'ADMIN'}</span>
            </div>
            <div className="user-avatar">
              {(user?.full_name || 'A').charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}