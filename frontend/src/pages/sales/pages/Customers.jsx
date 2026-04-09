import { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import "./CustomerManagement.css";

const EMPTY_FORM = { full_name: '', email: '', tel: '', address: '', password: '' };

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        SalesLogger.customers.pageLoad({ timestamp: new Date().toISOString() });
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            SalesLogger.customers.customersFetch({ action: 'fetch_customers' });
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/customers`);
            const data = await response.json();
            if (response.ok) {
                const fetched = data.customers || [];
                setCustomers(fetched);
                SalesLogger.customers.customersFetch(fetched.length);
            } else {
                setCustomers([]);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            SalesLogger.customers.customersFetchError(err);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setFormError('');
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');
        try {
            const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/sales/customers`, {
                method: 'POST',
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (response.ok) {
                setShowModal(false);
                setForm(EMPTY_FORM);
                fetchCustomers();
            } else {
                setFormError(data.error || 'Failed to create customer.');
            }
        } catch (err) {
            setFormError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: '8px',
        border: '1.5px solid #e2e8f0', fontSize: '14px',
        outline: 'none', boxSizing: 'border-box'
    };
    const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' };

    return (
        <div className="customer-management">
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h1>Customer Relationships</h1>
                    <p className="subtitle" style={{ margin: 0, color: '#64748b' }}>Manage and track your client base</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                    onClick={() => { setShowModal(true); setFormError(''); setForm(EMPTY_FORM); }}
                    style={{ padding: '8px 18px', fontSize: '13px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
                >
                    + Add Customer
                </button>
                <button
                    onClick={fetchCustomers}
                    disabled={loading}
                    style={{ padding: '8px 16px', fontSize: '12px', border: 'none', background: '#001a66', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
                >
                    <span style={{ fontSize: '14px' }}>🔄</span>
                    {loading ? 'Syncing...' : 'Sync Customers'}
                </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Total Orders</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No customers found.</td></tr>
                        ) : customers.map(customer => (
                            <tr key={customer.customer_id}>
                                <td>#{customer.customer_id}</td>
                                <td>{customer.full_name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone || 'N/A'}</td>
                                <td>{customer.address || 'N/A'}</td>
                                <td>{customer.total_orders}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Customer Modal */}
            {showModal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '480px', maxWidth: '95%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, color: '#001a66', fontSize: '18px', fontWeight: '800' }}>Add New Customer</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}>×</button>
                        </div>

                        <form onSubmit={handleAddCustomer} style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Full Name *</label>
                                <input name="full_name" value={form.full_name} onChange={handleFormChange} required style={inputStyle} placeholder="Enter full name" />
                            </div>
                            <div>
                                <label style={labelStyle}>Email *</label>
                                <input name="email" type="email" value={form.email} onChange={handleFormChange} required style={inputStyle} placeholder="Enter email address" />
                            </div>
                            <div>
                                <label style={labelStyle}>Phone (Tel) *</label>
                                <input name="tel" value={form.tel} onChange={handleFormChange} required style={inputStyle} placeholder="e.g. 0771234567" maxLength={10} />
                            </div>
                            <div>
                                <label style={labelStyle}>Address *</label>
                                <input name="address" value={form.address} onChange={handleFormChange} required style={inputStyle} placeholder="Enter delivery address" />
                            </div>
                            <div>
                                <label style={labelStyle}>Password *</label>
                                <input name="password" type="password" value={form.password} onChange={handleFormChange} required style={inputStyle} placeholder="Set a login password" />
                            </div>

                            {formError && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', color: '#b91c1c', fontSize: '13px' }}>
                                    {formError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: submitting ? '#94a3b8' : '#001a66', color: 'white', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer' }}>
                                    {submitting ? 'Saving...' : 'Save Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
