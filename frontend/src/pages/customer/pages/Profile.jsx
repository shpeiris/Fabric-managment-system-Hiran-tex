import { useState, useEffect } from 'react'

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    username: '',
    address: '123 Main Street, Colombo',
    city: 'Colombo',
    postalCode: '00100'
  })

  useEffect(() => {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'))
    if (userData) {
      setUser(userData)
      setFormData({
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        username: userData.username || '',
        address: '123 Main Street, Colombo',
        city: 'Colombo',
        postalCode: '00100'
      })
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    // Save logic here
    setIsEditing(false)
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>My Profile</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Manage your account information and preferences.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Profile Picture Section */}
        <div>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: '#2563eb',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: 'white',
              fontWeight: '600'
            }}>
              {formData.full_name ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '5px' }}>{formData.full_name || 'User'}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>{user?.role?.replace('_', ' ') || 'Customer'}</p>
            <button style={{
              background: 'transparent',
              color: '#2563eb',
              border: '1px solid #2563eb',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500',
              width: '100%'
            }}>
              Change Photo
            </button>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '15px' }}>Account Stats</h3>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Member Since</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>January 2024</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total Orders</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>15 orders</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Loyalty Points</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#22c55e' }}>2,340 points</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div>
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Personal Information</h2>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                style={{
                  background: isEditing ? '#22c55e' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    background: isEditing ? 'white' : '#f9fafb',
                    color: '#1f2937'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#f9fafb',
                    color: '#6b7280'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    background: isEditing ? 'white' : '#f9fafb',
                    color: '#1f2937'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    background: isEditing ? 'white' : '#f9fafb',
                    color: '#1f2937'
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    background: isEditing ? 'white' : '#f9fafb',
                    color: '#1f2937'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    background: isEditing ? 'white' : '#f9fafb',
                    color: '#1f2937'
                  }}
                />
              </div>
            </div>

            {isEditing && (
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #e5e7eb',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Security Section */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '30px',
            marginTop: '20px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '20px' }}>Security</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb', marginBottom: '15px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>Password</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>••••••••</p>
              </div>
              <button style={{
                background: 'transparent',
                color: '#2563eb',
                border: '1px solid #2563eb',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                Change Password
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>Two-Factor Authentication</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Not enabled</p>
              </div>
              <button style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
