import { NavLink, Link } from 'react-router-dom'

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
      {/* Top Banner: Logo and Branch Name */}
      <div style={{ padding: '0 20px', marginBottom: '30px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#7cff00', marginBottom: '5px' }}>
            🏠Hiran Fabric Textile
          </h2>
        </Link>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Customer Portal</p>
      </div>

      {/* Navigation Menu: List of links the customer can click */}
      <nav>
        {/* Link 1: Main Dashboard Overview */}
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

        {/* Link 2: View and Search all available fabrics */}
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

        {/* Link 3: View current items added to the Cart before checking out */}
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

        {/* Link 4: Track current orders and view past purchases */}
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

        {/* Link 5: View payment history and upload bank slips */}
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

        {/* Link 6: System notifications and alerts */}
        <NavLink
          to="/customer/notifications"
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
          Notifications
        </NavLink>

        {/* Link 7: Update personal details (Account Settings) */}
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
