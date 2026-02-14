import React, { useState } from 'react'

const FabricManagement = () => {
  const [fabrics, setFabrics] = useState([])

  return (
    <div className="fabric-management">
      <h1>Fabric Management</h1>
      <div className="fabric-controls">
        <button className="add-fabric-btn">Add New Fabric</button>
        <div className="search-bar">
          <input type="text" placeholder="Search fabrics..." />
        </div>
      </div>
      <div className="fabric-list">
        <table>
          <thead>
            <tr>
              <th>Fabric ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Color</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fabrics.length === 0 && (
              <tr>
                <td colSpan="7">No fabrics found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FabricManagement