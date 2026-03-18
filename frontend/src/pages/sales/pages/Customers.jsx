import { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import "./CustomerManagement.css";

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        SalesLogger.customers.pageLoad({ timestamp: new Date().toISOString() });
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            SalesLogger.customers.search(searchTerm);
        }
    }, [searchTerm]);

    const SAMPLE_CUSTOMER = {
        customer_id: 'PRE-001',
        full_name: 'Pathum Nissanka (Sample)',
        email: 'pathum.n@example.lk',
        phone: '+94 71 987 6543',
        total_orders: 5,
        total_spent: 15200,
        registration_date: '2024-03-05T09:15:00Z'
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            SalesLogger.customers.customersFetch({ action: 'fetch_customers' });
            const response = await apiCall('http://localhost:5000/api/sales/customers');
            const data = await response.json();

            if (response.ok) {
                const fetched = data.customers || [];
                setCustomers([SAMPLE_CUSTOMER, ...fetched]);
                SalesLogger.customers.customersFetch(fetched.length + 1);
            } else {
                setCustomers([SAMPLE_CUSTOMER]);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            SalesLogger.customers.customersFetchError(err);
            setCustomers([SAMPLE_CUSTOMER]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="customer-management">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                    <h1>Customer Relationships</h1>
                    <p className="subtitle">Manage and track your client base</p>
                </div>
                <button 
                  onClick={fetchCustomers} 
                  disabled={loading}
                  className="action-btn orders-btn" 
                  style={{ padding: '8px 16px', fontSize: '12px', border: 'none', background: '#001a66', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
                >
                  <span style={{ fontSize: '14px' }}>🔄</span>
                  {loading ? 'Syncing...' : 'Sync Customers'}
                </button>
            </div>

            {/* Search */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
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
                            <th>Total Orders</th>
                            <th>Total Spent</th>
                            <th>Member Since</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(customer => (
                            <tr key={customer.customer_id}>
                                <td>#{customer.customer_id}</td>
                                <td>{customer.full_name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone || 'N/A'}</td>
                                <td>{customer.total_orders}</td>
                                <td>Rs. {Number(customer.total_spent).toLocaleString()}</td>
                                <td>{new Date(customer.registration_date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
