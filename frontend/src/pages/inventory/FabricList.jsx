import { useState, useEffect } from 'react';
import { apiCall } from "../../utils/auth.js";
import "./FabricManagement.css";

export default function FabricManagement() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFabric, setEditingFabric] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    material_type: '',
    design: '',
    price_per_meter: '',
    stock_quantity: '',
    reorder_level: '100',
    restock_date: '',
    image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSource, setImageSource] = useState('select'); // 'select' or 'upload'

  useEffect(() => {
    fetchFabrics();
  }, []);

  const fetchFabrics = async () => {
    try {
      setLoading(true);
      const response = await apiCall('http://localhost:5000/api/inventory/fabrics');
      const data = await response.json();

      if (response.ok) {
        setFabrics(data.fabrics || []);
      }
    } catch (err) {
      console.error('Error fetching fabrics:', err);
      alert('Failed to load fabrics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingFabric
        ? `http://localhost:5000/api/inventory/fabrics/${editingFabric.fabric_id}`
        : 'http://localhost:5000/api/inventory/fabrics';

      const method = editingFabric ? 'PUT' : 'POST';

      let response;
      if (imageSource === 'upload' && selectedFile) {
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          formDataToSend.append(key, formData[key]);
        });
        formDataToSend.append('image', selectedFile);

        response = await apiCall(url, {
          method,
          body: formDataToSend,
          headers: {} // apiCall usually sets JSON headers, we need to let the browser set boundary for FormData
        });
      } else {
        response = await apiCall(url, {
          method,
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setShowModal(false);
        resetForm();
        fetchFabrics();
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving fabric:', err);
      alert('Failed to save fabric');
    }
  };

  const handleEdit = (fabric) => {
    setEditingFabric(fabric);
    setFormData({
      name: fabric.name,
      material_type: fabric.material_type || '',
      design: fabric.design || '',
      price_per_meter: fabric.price_per_meter,
      stock_quantity: fabric.stock_quantity,
      reorder_level: fabric.reorder_level,
      restock_date: fabric.restock_date && !isNaN(new Date(fabric.restock_date))
        ? new Date(fabric.restock_date).toISOString().split('T')[0]
        : '',
      image_url: fabric.image_url || ''
    });
    setSelectedFile(null);
    setImageSource(fabric.image_url?.startsWith('uploads/') ? 'upload' : 'select');
    setShowModal(true);
  };

  const handleDelete = async (fabricId) => {
    if (!confirm('Are you sure you want to delete this fabric?')) return;

    try {
      const response = await apiCall(`http://localhost:5000/api/inventory/fabrics/${fabricId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchFabrics();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Error deleting fabric:', err);
      alert('Failed to delete fabric');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      material_type: '',
      design: '',
      price_per_meter: '',
      stock_quantity: '',
      reorder_level: '100',
      restock_date: '',
      image_url: ''
    });
    setEditingFabric(null);
    setSelectedFile(null);
    setImageSource('select');
  };

  const filteredFabrics = fabrics.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.material_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fabric-management">
      <div className="header">
        <div>
          <h1>Fabric Management</h1>
          <p className="subtitle">Manage your fabric inventory</p>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + Add New Fabric
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search fabrics by name or material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Fabrics Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Material</th>
              <th>Design</th>
              <th>Price/m</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFabrics.map(fabric => (
              <tr key={fabric.fabric_id}>
                <td>#{fabric.fabric_id}</td>
                <td>{fabric.name}</td>
                <td>{fabric.material_type}</td>
                <td>{fabric.design}</td>
                <td>Rs. {Number(fabric.price_per_meter).toFixed(2)}</td>
                <td>{fabric.stock_quantity} m</td>
                <td>
                  {(() => {
                    const status = fabric.stock_status || 'OK';
                    let label = 'In Stock';
                    let icon = '✔';
                    
                    if (status === 'LOW') {
                      label = 'Low Stock';
                      icon = '⚠';
                    } else if (status === 'OUT_OF_STOCK') {
                      label = 'Out of Stock';
                      icon = '✖';
                    }

                    return (
                      <span className={`status-badge ${status.toLowerCase()}`}>
                        <span style={{ marginRight: '5px' }}>{icon}</span>
                        {label}
                      </span>
                    );
                  })()}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(fabric)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(fabric.fabric_id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingFabric ? 'Edit Fabric' : 'Add New Fabric'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Fabric Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Material Type</label>
                  <input
                    type="text"
                    value={formData.material_type}
                    onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                  />
                </div>


                <div className="form-group">
                  <label>Design</label>
                  <input
                    type="text"
                    value={formData.design}
                    onChange={(e) => setFormData({ ...formData, design: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Price per Meter *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price_per_meter}
                    onChange={(e) => setFormData({ ...formData, price_per_meter: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Restock Date</label>
                  <input
                    type="date"
                    value={formData.restock_date}
                    onChange={(e) => setFormData({ ...formData, restock_date: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Image Selection</label>
                  <div className="image-source-toggle">
                    <button 
                      type="button" 
                      className={`btn-toggle ${imageSource === 'select' ? 'active' : ''}`}
                      onClick={() => setImageSource('select')}
                    >
                      Select Existing
                    </button>
                    <button 
                      type="button" 
                      className={`btn-toggle ${imageSource === 'upload' ? 'active' : ''}`}
                      onClick={() => setImageSource('upload')}
                    >
                      Upload from PC
                    </button>
                  </div>

                  <div className="image-selection-container">
                    {imageSource === 'select' ? (
                      <select
                        className="image-select"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      >
                        <option value="">No Image</option>
                        <option value="satin_orange.jpg">Satin Orange</option>
                        <option value="satin_cream.jpg">Satin Cream</option>
                        <option value="satin_maroon.jpg">Satin Maroon</option>
                        <option value="linen_green.jpg">Linen Green</option>
                        <option value="fabric-collage.jpg">Fabric Collage (Default)</option>
                      </select>
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="file-input"
                      />
                    )}
                    
                    {(formData.image_url || selectedFile) && (
                      <div className="image-preview-modal">
                        <img 
                          src={selectedFile 
                            ? URL.createObjectURL(selectedFile) 
                            : (formData.image_url?.startsWith('uploads/') 
                                ? `http://localhost:5000/${formData.image_url}` 
                                : (formData.image_url?.startsWith('http') 
                                    ? formData.image_url 
                                    : `/src/assets/Fabrics/${formData.image_url || 'fabric-collage.jpg'}`))
                          } 
                          alt="Preview" 
                          onError={(e) => {
                            e.target.src = '/src/assets/Fabrics/fabric-collage.jpg';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingFabric ? 'Update' : 'Add'} Fabric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
