import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUser, removeUser, apiCall } from '../../../utils/auth.js';

const SalesSidebar = () => {
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

  const menuItems = [
    { name: 'Dashboard', path: '/sales/dashboard' },
    { name: 'Customers', path: '/sales/customers' },
    { name: 'Orders', path: '/sales/orders' },
    { name: 'Reports', path: '/sales/reports' }
  ];

  return (
    <aside style={{
      width: '260px',
      minHeight: '100vh',
      background: '#001a66',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 15px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Header */}
      <div style={{
        padding: '25px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px', color: '#7cff00' }}>Hiran Fabrics</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '14px 25px',
              color: isActive ? '#7cff00' : 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              borderLeft: isActive ? '4px solid #7cff00' : '4px solid transparent',
              background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
            })}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer with User Info and Logout */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '15px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #7cff00, #6ee000)',
            color: '#001a66',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {(user?.full_name || 'S').charAt(0)}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || 'Salesperson'}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
              {user?.role || 'SALESPERSON'}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 0, 0, 0.2)';
            e.target.style.borderColor = 'rgba(255, 0, 0, 0.3)';
            e.target.style.color = '#ffcccc';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.color = 'white';
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SalesSidebar;