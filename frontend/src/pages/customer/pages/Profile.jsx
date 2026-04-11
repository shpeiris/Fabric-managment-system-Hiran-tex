import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall, getUser } from '../../../utils/auth.js';
import customerService from '../../../services/customerService.js';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import "./Profile.css";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`;

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
    if (!formData.full_name || !formData.phone || !formData.address) {
      setErrorMsg('Full name, phone, and address are required');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, "");
    if (!/^\d{10}$/.test(cleanPhone)) {
      setErrorMsg('Phone number must be exactly 10 digits');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await customerService.updateProfile({
        full_name: formData.full_name,
        phone: cleanPhone,
        address: formData.address,
      });
      
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

  if (loading) return (
    <div className="loading-container">
      <div className="pulse-loader"></div>
      <p>Synchronizing your profile...</p>
    </div>
  );

  const initials = formData.full_name
    ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="profile-container">
      {/* Simplified Header */}
      <header className="profile-header">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            <div className="avatar-initials">{initials}</div>
          </div>
          <div className="profile-title-info">
            <h1>{formData.full_name || 'User Profile'}</h1>
            <p>Verified Customer</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="profile-content-single">

        {/* Form Area - View Only Card */}
        <main className="form-card">
          <div className="card-header">
            <h2>Personal Information</h2>
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>

          {successMsg && (
            <div className="message success">
              <CheckCircle size={18} /> {successMsg}
            </div>
          )}
          
          <div className="profile-form-grid">
            <div className="form-group">
              <label><User size={14} /> Full Name</label>
              <div className="premium-input" style={{ background: '#f9fafb', color: '#1f2937' }}>{formData.full_name}</div>
            </div>


            <div className="form-group">
              <label><Mail size={14} /> Primary Email</label>
              <div className="premium-input" style={{ background: '#f9fafb', color: '#6b7280' }}>{formData.email}</div>
            </div>

            <div className="form-group">
              <label><Phone size={14} /> Phone Number</label>
              <div className="premium-input" style={{ background: '#f9fafb', color: '#1f2937' }}>{formData.phone}</div>
            </div>

            <div className="form-group full-width">
              <label><MapPin size={14} /> Physical Address</label>
              <div className="premium-input" style={{ background: '#f9fafb', color: '#1f2937' }}>{formData.address}</div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className={`modal-overlay ${saving ? 'syncing' : ''}`}>
          <div className="modal-card">
            <div className="modal-header">
              <h2><Edit3 size={20} /> Update Profile</h2>
              <button 
                className="modal-close" 
                onClick={() => { setIsEditing(false); setErrorMsg(''); }}
                disabled={saving}
              >
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {errorMsg && (
                <div className="message error">
                  <AlertCircle size={18} /> {errorMsg}
                </div>
              )}

              <div className="profile-form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="full_name" 
                    className="premium-input"
                    value={formData.full_name} 
                    onChange={handleChange} 
                    placeholder="Enter your full name"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="premium-input"
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="07X XXX XXXX"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Physical Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    className="premium-input"
                    value={formData.address} 
                    onChange={handleChange} 
                    placeholder="Enter your delivery address"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Synchronizing...' : 'Save Changes'}
              </button>
              <button 
                className="btn-cancel" 
                onClick={() => { setIsEditing(false); setErrorMsg(''); }}
                disabled={saving}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
