import { useState, useEffect } from 'react';
import { apiCall } from "../../../utils/auth.js";
import SalesLogger from "../../../utils/salesLogger.js";
import "./CustomerManagement.css";

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

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



    return (
        <div className="customer-management">
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h1>Customer Relationships</h1>
                <button
                    onClick={fetchCustomers}
                    disabled={loading}
                    style={{ padding: '8px 16px', fontSize: '12px', border: 'none', background: '#001a66', color: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
                >
                    <span style={{ fontSize: '14px' }}>🔄</span>
                    {loading ? 'Syncing...' : 'Sync Customers'}
                </button>
            </div>
            <p className="subtitle">Manage and track your client base</p>

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


        </div>
    );
}
