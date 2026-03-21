import React, { useState } from 'react'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')

  return (
    <div className="user-management">
      <h1>User Management</h1>
      <div className="user-controls">
        <button className="add-user-btn">Add New User</button>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="inventory">Inventory Manager</option>
          <option value="sales">Sales Representative</option>
        </select>
        <div className="search-bar">
          <input type="text" placeholder="Search users..." />
        </div>
      </div>
      <div className="user-list">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="7">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement
