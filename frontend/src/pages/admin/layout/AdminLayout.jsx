import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, removeUser, apiCall } from "../../../utils/auth.js";
import Sidebar from "../components/Sidebar.jsx";
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
      await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/logout`, {
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
      <Sidebar onLogout={handleLogout} />

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
