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
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fabric_id: '',
    name: '',
    material_type: '',
    color: '',
    design: '',
    price_per_meter: '',
    stock_quantity: '',
    reorder_level: '',
    width: '',
    restock_date: '',
    existing_image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

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
          image: fabric.image_url 
            ? (fabric.image_url.startsWith('http') ? fabric.image_url : `http://localhost:5000/${fabric.image_url}`)
            : 'https://via.placeholder.com/300x200?text=No+Image',
          reorder_level: fabric.reorder_level || 0,
          restock_date: fabric.restock_date,
          image_url: fabric.image_url, // Original raw URL/path
          status: getStockStatus(fabric.stock_quantity, fabric.reorder_level),
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      const url = isEditing 
        ? `http://localhost:5000/api/inventory/fabrics/${formData.fabric_id}`
        : 'http://localhost:5000/api/inventory/fabrics';
      
      const response = await apiCall(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: data // apiCall handles FormData headers
      });

      if (response.ok) {
        alert(`Fabric ${isEditing ? 'updated' : 'added'} successfully!`);
        setShowModal(false);
        resetForm();
        fetchFabrics();
      } else {
        let errorMessage = 'Operation failed';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const textError = await response.text();
            console.error('Non-JSON error:', textError);
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fabric_id: '',
      name: '',
      material_type: '',
      color: '',
      design: '',
      price_per_meter: '',
      stock_quantity: '',
      reorder_level: '',
      width: '',
      restock_date: '',
      existing_image_url: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
  };

  const handleEdit = (fabric) => {
    setFormData({
      fabric_id: fabric.fabric_id,
      name: fabric.name,
      material_type: fabric.material_type || '',
      color: fabric.color || '',
      design: fabric.design || '',
      price_per_meter: fabric.price,
      stock_quantity: fabric.stock,
      reorder_level: fabric.reorder_level,
      width: fabric.width || '',
      restock_date: fabric.restock_date ? fabric.restock_date.split('T')[0] : '',
      existing_image_url: fabric.image_url || '' // fabric.image_url is the original raw path
    });
    setImagePreview(fabric.image);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fabric?')) return;
    try {
      const response = await apiCall(`http://localhost:5000/api/inventory/fabrics/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Fabric deleted successfully');
        fetchFabrics();
      }
    } catch (err) {
      console.error('Error deleting fabric:', err);
      alert('Failed to delete fabric');
    }
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
              <option value="linen">Linen</option>
              <option value="rayon">Rayon</option>
              <option value="denim">Denim</option>
              <option value="synthetic">Synthetic</option>
              <option value="velvet">Velvet</option>
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
              onClick={() => { resetForm(); setShowModal(true); }}
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
                  <button 
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() => handleEdit(fabric)}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-red-500 text-sm hover:underline"
                    onClick={() => handleDelete(fabric.fabric_id)}
                  >
                    Delete
                  </button>
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
                        <button 
                          className="text-blue-600 text-sm hover:underline"
                          onClick={() => handleEdit(fabric)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-500 text-sm hover:underline"
                          onClick={() => handleDelete(fabric.fabric_id)}
                        >
                          Delete
                        </button>
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {isEditing ? 'Edit Fabric' : 'Add New Fabric'}
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Name *</label>
                    <input 
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="e.g. Premium Linen Cotton" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category / Material *</label>
                    <select 
                      required
                      name="material_type"
                      value={formData.material_type}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Category</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Silk">Silk</option>
                      <option value="Linen">Linen</option>
                      <option value="Rayon">Rayon</option>
                      <option value="Denim">Denim</option>
                      <option value="Synthetic">Synthetic</option>
                      <option value="Velvet">Velvet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input 
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="e.g. Midnight Blue" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Design / Pattern</label>
                    <input 
                      name="design"
                      value={formData.design}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="e.g. Plain / Floral" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                    <input 
                      name="width"
                      value={formData.width}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="e.g. 45 inch" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock (meters) *</label>
                    <input 
                      required
                      type="number" 
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="0.00" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per meter (Rs.) *</label>
                    <input 
                      required
                      type="number" 
                      name="price_per_meter"
                      value={formData.price_per_meter}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="0.00" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
                    <input 
                      required
                      type="number" 
                      name="reorder_level"
                      value={formData.reorder_level}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="50" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restock Date</label>
                    <input 
                      type="date" 
                      name="restock_date"
                      value={formData.restock_date}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Image</label>
                    <div className="flex gap-4 items-center border p-4 rounded bg-gray-50 border-dashed">
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                      </div>
                      {imagePreview && (
                        <div className="w-20 h-20 bg-white border rounded overflow-hidden">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button 
                      type="button"
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={formSubmitting}
                      className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                    >
                      {formSubmitting ? 'Saving...' : (isEditing ? 'Update Fabric' : 'Add Fabric')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryFabricManagement;