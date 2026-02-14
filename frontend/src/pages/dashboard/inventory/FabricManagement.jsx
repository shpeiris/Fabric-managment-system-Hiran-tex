import React, { useState, useEffect } from 'react';
import { apiCall } from '../../../utils/auth.js';

const InventoryFabricManagement = () => {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchFabrics();
  }, []);

  const fetchFabrics = async () => {
    try {
      setLoading(true);
      const response = await apiCall('http://localhost:5000/api/inventory/fabrics');
      const data = await response.json();

      if (response.ok) {
        // Transform database data to match component expectations
        const transformedFabrics = (data.fabrics || []).map(fabric => ({
          id: `FAB${fabric.fabric_id.toString().padStart(3, '0')}`,
          fabric_id: fabric.fabric_id,
          name: fabric.name,
          stock: fabric.stock_quantity || 0,
          price: parseFloat(fabric.price_per_meter),
          category: fabric.material_type ? fabric.material_type.toLowerCase() : 'other',
          material_type: fabric.material_type,
          color: fabric.color,
          design: fabric.design,
          image: fabric.image_url || 'https://via.placeholder.com/300x200?text=No+Image',
          restock_level: fabric.restock_level || 0,
          restock_date: fabric.restock_date,
          status: getStockStatus(fabric.stock_quantity, fabric.restock_level),
          created_at: fabric.created_at
        }));
        setFabrics(transformedFabrics);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch fabrics');
      }
    } catch (err) {
      console.error('Error fetching fabrics:', err);
      setError('Failed to load fabric data');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock, restockLevel) => {
    if (!stock || stock === 0) return 'out-of-stock';
    if (stock <= restockLevel) return 'low-stock';
    return 'in-stock';
  };

  const filteredFabrics = fabrics.filter(fabric => {
    const matchesSearch = fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         fabric.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fabric.material_type && fabric.material_type.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || fabric.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || fabric.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Fabric Inventory Management</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            Loading fabrics...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Fabric Inventory Management</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'red' }}>
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-700'
      case 'low-stock': return 'bg-yellow-100 text-yellow-700'
      case 'out-of-stock': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Fabric Inventory Management</h2>
      <div className="bg-white rounded-xl shadow p-4">
        {/* Controls */}
        <div className="flex justify-between mb-4">
          <div className="flex gap-4">
            <input 
              className="border p-2 rounded w-80" 
              placeholder="Search fabrics by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="border p-2 rounded"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="cotton">Cotton</option>
              <option value="silk">Silk</option>
              <option value="polyester">Polyester</option>
              <option value="linen">Linen</option>
              <option value="viscose">Viscose</option>
            </select>
            <select 
              className="border p-2 rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              className={`px-4 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button 
              className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button 
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setShowAddModal(true)}
            >
              Add New Fabric
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-3 gap-4">
            {filteredFabrics.map((fabric) => (
              <div key={fabric.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="h-32 bg-gray-200 rounded mb-3 overflow-hidden">
                  <img 
                    src={fabric.image} 
                    alt={fabric.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{fabric.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(fabric.status)}`}>
                    {fabric.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">ID: {fabric.id}</p>
                <p className="text-sm text-gray-600 mb-1">Stock: {fabric.stock} m</p>
                <p className="text-sm text-gray-600 mb-3">Price: Rs. {fabric.price}</p>
                <div className="flex gap-2">
                  <button className="text-blue-600 text-sm hover:underline">Edit</button>
                  <button className="text-blue-600 text-sm hover:underline">Update Stock</button>
                  <button className="text-red-500 text-sm hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Fabric ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-center">Stock (m)</th>
                  <th className="p-3 text-center">Price (Rs.)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFabrics.map((fabric) => (
                  <tr key={fabric.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                        <img 
                          src={fabric.image} 
                          alt={fabric.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-blue-600 font-medium">{fabric.id}</td>
                    <td className="p-3 font-medium">{fabric.name}</td>
                    <td className="p-3 text-center">{fabric.stock}</td>
                    <td className="p-3 text-center">{fabric.price}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(fabric.status)}`}>
                        {fabric.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="text-blue-600 text-sm hover:underline">Edit</button>
                        <button className="text-blue-600 text-sm hover:underline">Stock</button>
                        <button className="text-red-500 text-sm hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredFabrics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No fabrics found matching your criteria.
          </div>
        )}

        {/* Add Fabric Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Add New Fabric</h3>
              <form className="space-y-4">
                <input className="w-full border p-2 rounded" placeholder="Fabric Name" />
                <input className="w-full border p-2 rounded" placeholder="Fabric ID" />
                <select className="w-full border p-2 rounded">
                  <option value="">Select Category</option>
                  <option value="cotton">Cotton</option>
                  <option value="silk">Silk</option>
                  <option value="polyester">Polyester</option>
                  <option value="linen">Linen</option>
                  <option value="viscose">Viscose</option>
                </select>
                <input className="w-full border p-2 rounded" placeholder="Initial Stock (meters)" type="number" />
                <input className="w-full border p-2 rounded" placeholder="Price per meter (Rs.)" type="number" />
                <input className="w-full border p-2 rounded" placeholder="Reorder Level" type="number" />
                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Add Fabric
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryFabricManagement
    </div>
  )
}

export default InventoryFabricManagement