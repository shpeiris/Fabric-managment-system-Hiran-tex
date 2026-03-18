import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, getUser } from '../../../utils/auth.js';
import customerService from '../../../services/customerService.js';

const API = 'http://localhost:5000';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0 });
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    username: '',
    address: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Load from /auth/me for fresh data
        const res = await apiCall(`${API}/auth/me`);
        const data = await res.json();
        if (res.ok && data.user) {
          const u = data.user;
          setUser(u);
          setFormData({
            full_name: u.full_name || '',
            email: u.email || '',
            phone: u.phone || u.tel || '',
            username: u.username || u.email || '',
            address: u.address || '',
          });
        } else {
          // Fallback to localStorage
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(stored);
          setFormData({
            full_name: stored.full_name || '',
            email: stored.email || '',
            phone: stored.phone || stored.tel || '',
            username: stored.username || stored.email || '',
            address: stored.address || '',
          });
        }

        // Load stats
        const statsRes = await apiCall(`${API}/api/customer/dashboard-stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(stored);
        setFormData({
          full_name: stored.full_name || '',
          email: stored.email || '',
          phone: stored.phone || stored.tel || '',
          username: stored.username || stored.email || '',
          address: stored.address || '',
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await customerService.updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
      });
      
      // Update localStorage user
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, ...data.user };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (editable) => ({
    width: '100%', padding: '12px', border: '1px solid #e5e7eb',
    borderRadius: '6px', fontSize: '14px', outline: 'none',
    background: editable ? 'white' : '#f9fafb',
    color: editable ? '#1f2937' : '#6b7280',
    boxSizing: 'border-box'
  });

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading profile...</div>
  );

  const initials = formData.full_name
    ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1f2937', fontWeight: '600' }}>My Profile</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px' }}>Manage your account information and preferences.</p>

      {successMsg && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#065f46', fontSize: '14px', fontWeight: '500' }}>
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#991b1b', fontSize: '14px', fontWeight: '500' }}>
          ❌ {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left - Avatar + Stats */}
        <div>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: 'white', fontWeight: '700' }}>
              {initials}
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{formData.full_name || 'User'}</h3>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>Customer</p>
          </div>

          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Account Stats</h3>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Member Since</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{memberSince}</p>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Total Orders</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{stats.totalOrders || 0} orders</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Total Spent</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#2563eb' }}>Rs. {(stats.totalSpent || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} disabled={!isEditing} style={inputStyle(isEditing)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Username / Email</label>
                <input type="text" name="username" value={formData.username} disabled={true} style={inputStyle(false)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Email Address</label>
                <input type="email" name="email" value={formData.email} disabled={true} style={inputStyle(false)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} style={inputStyle(isEditing)} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} style={inputStyle(isEditing)} />
              </div>
            </div>

            {isEditing && (
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ flex: 1, background: saving ? '#86efac' : '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '500' }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => { setIsEditing(false); setErrorMsg(''); }}
                  style={{ flex: 1, background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
