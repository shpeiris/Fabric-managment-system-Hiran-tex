import { NavLink } from 'react-router-dom'

export default function CustomerSidebar() {
  return (
    <div style={{
      width: '220px',
      background: '#1e3a8a',
      minHeight: '100vh',
      color: 'white',
      padding: '20px 0',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto'
    }}>
      {/* Logo/Brand */}
      <div style={{ padding: '0 20px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#7cff00', marginBottom: '5px' }}>
          Hiran Fabrics
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Customer Portal</p>
      </div>

      {/* Navigation */}
      <nav>
        <NavLink
          to="/customer/dashboard"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            textDecoration: 'none',
            color: isActive ? '#22c55e' : 'white',
            background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
            fontSize: '14px',
            fontWeight: isActive ? '500' : '400',
            transition: 'all 0.2s'
          })}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/customer/browse"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            textDecoration: 'none',
            color: isActive ? '#22c55e' : 'white',
            background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
            fontSize: '14px',
            fontWeight: isActive ? '500' : '400',
            transition: 'all 0.2s'
          })}
        >
          Browse Fabrics
        </NavLink>

        <NavLink
          to="/customer/cart"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            textDecoration: 'none',
            color: isActive ? '#22c55e' : 'white',
            background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
            fontSize: '14px',
            fontWeight: isActive ? '500' : '400',
            transition: 'all 0.2s'
          })}
        >
          Shopping Cart
        </NavLink>

        <NavLink
          to="/customer/orders"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            textDecoration: 'none',
            color: isActive ? '#22c55e' : 'white',
            background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
            fontSize: '14px',
            fontWeight: isActive ? '500' : '400',
            transition: 'all 0.2s'
          })}
        >
          My Orders
        </NavLink>

        <NavLink
          to="/customer/payments"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            textDecoration: 'none',
            color: isActive ? '#22c55e' : 'white',
            background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
            fontSize: '14px',
            fontWeight: isActive ? '500' : '400',
            transition: 'all 0.2s'
          })}
        >
          Payments
        </NavLink>

        <NavLink
          to="/customer/profile"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            textDecoration: 'none',
            color: isActive ? '#22c55e' : 'white',
            background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
            borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
            fontSize: '14px',
            fontWeight: isActive ? '500' : '400',
            transition: 'all 0.2s'
          })}
        >
          Profile
        </NavLink>
      </nav>
    </div>
  )
}
