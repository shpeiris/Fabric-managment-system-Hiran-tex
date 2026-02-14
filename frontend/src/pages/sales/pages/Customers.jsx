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

    const HARDCODED_SRI_LANKAN_CUSTOMERS = [
        {
            id: 'H1',
            full_name: 'Anura Kumara Dissanayake',
            email: 'anura.k@example.lk',
            phone: '+94 11 234 5678',
            total_orders: 12,
            total_spent: 45000,
            created_at: '2024-01-15T10:30:00Z'
        },
        {
            id: 'H2',
            full_name: 'Nimmi Harasgama',
            email: 'nimmi.h@example.lk',
            phone: '+94 77 123 4567',
            total_orders: 8,
            total_spent: 28500,
            created_at: '2024-02-20T14:45:00Z'
        },
        {
            id: 'H3',
            full_name: 'Pathum Nissanka',
            email: 'pathum.n@example.lk',
            phone: '+94 71 987 6543',
            total_orders: 5,
            total_spent: 15200,
            created_at: '2024-03-05T09:15:00Z'
        },
        {
            id: 'H4',
            full_name: 'Chamari Athapaththu',
            email: 'chamari.a@example.lk',
            phone: '+94 76 555 4433',
            total_orders: 15,
            total_spent: 62000,
            created_at: '2023-11-12T11:20:00Z'
        },
        {
            id: 'H5',
            full_name: 'Wanindu Hasaranga',
            email: 'wanindu.h@example.lk',
            phone: '+94 72 333 2211',
            total_orders: 3,
            total_spent: 9800,
            created_at: '2024-05-01T16:00:00Z'
        }
    ];

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            SalesLogger.customers.customersFetch({ action: 'fetch_customers' });
            const response = await apiCall('http://localhost:5000/api/sales/customers');
            const data = await response.json();

            if (response.ok) {
                const fetchedCustomers = data.customers || [];
                setCustomers([...HARDCODED_SRI_LANKAN_CUSTOMERS, ...fetchedCustomers]);
                SalesLogger.customers.customersFetch((data.customers?.length || 0) + HARDCODED_SRI_LANKAN_CUSTOMERS.length);
            } else {
                setCustomers(HARDCODED_SRI_LANKAN_CUSTOMERS);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            SalesLogger.customers.customersFetchError(err);
            setCustomers(HARDCODED_SRI_LANKAN_CUSTOMERS);
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
            <div className="header">
                <div>
                    <h1>Customer Management</h1>
                    <p className="subtitle">Manage your customer relationships</p>
                </div>
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
                            <tr key={customer.id}>
                                <td>#{customer.id}</td>
                                <td>{customer.full_name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone || 'N/A'}</td>
                                <td>{customer.total_orders}</td>
                                <td>Rs. {Number(customer.total_spent).toLocaleString()}</td>
                                <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
