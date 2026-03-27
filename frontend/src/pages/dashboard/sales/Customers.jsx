import React, { useState } from 'react'

const SalesCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="sales-customers">
      <h1>Customer Management</h1>
      <div className="customers-overview">
        <div className="overview-cards">
          <div className="overview-card">
            <h3>Total Customers</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>New This Month</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>Active Customers</h3>
            <p>--</p>
          </div>
          <div className="overview-card">
            <h3>VIP Customers</h3>
            <p>--</p>
          </div>
        </div>
      </div>
      <div className="customer-controls">
        <input 
          type="text" 
          placeholder="Search customers..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select>
          <option value="all">All Customers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="vip">VIP</option>
        </select>
        <button>Export List</button>
      </div>
      <div className="customers-list">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan="8">No customers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalesCustomers
