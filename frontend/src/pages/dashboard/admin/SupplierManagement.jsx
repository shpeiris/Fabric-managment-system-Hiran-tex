import React, { useState } from 'react'

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([])

  return (
    <div className="supplier-management">
      <h1>Supplier Management</h1>
      <div className="supplier-controls">
        <button className="add-supplier-btn">Add New Supplier</button>
        <div className="search-bar">
          <input type="text" placeholder="Search suppliers..." />
        </div>
      </div>
      <div className="supplier-list">
        <table>
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr>
                <td colSpan="8">No suppliers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SupplierManagement