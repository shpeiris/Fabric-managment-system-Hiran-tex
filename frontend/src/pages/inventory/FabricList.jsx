import { useState, useEffect } from 'react';
import { apiCall } from "../../utils/auth.js";
import "./FabricManagement.css";
import { catalogService } from "../../services";

const FABRIC_COLORS = [
  { name: 'Espresso', hex: '#1a1515' },
  { name: 'Peach', hex: '#fcdfd4' },
  { name: 'Tan', hex: '#a87958' },
  { name: 'Cream', hex: '#eae8d4' },
  { name: 'Sage', hex: '#718a83' },
  { name: 'Ice Blue', hex: '#e8eff0' },
  { name: 'Indigo', hex: '#3b4d61' },
  { name: 'Oxford Blue', hex: '#2a3d54' },
  { name: 'Royal Blue', hex: '#164893' },
  { name: 'Black', hex: '#000000' },
  { name: 'Maroon', hex: '#2d0a14' },
  { name: 'Mauve', hex: '#b58d97' },
  { name: 'Pink', hex: '#df7892' },
  { name: 'Salmon', hex: '#e996a0' },
  { name: 'Crimson', hex: '#a1142e' },
  { name: 'Auburn', hex: '#693438' },
  { name: 'Coral', hex: '#e3444d' },
  { name: 'Gold', hex: '#ffd700' },
  { name: 'Mustard', hex: '#e1ad01' },
  { name: 'Emerald', hex: '#2e8b57' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Mint', hex: '#aaf0d1' }
];

export default function FabricManagement() {
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFabric, setEditingFabric] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [selectedColors, setSelectedColors] = useState([]);
  const [customColors, setCustomColors] = useState([]); // New custom colors picked via wheel
  const [variantQuantities, setVariantQuantities] = useState({}); // { '#hex': quantity_string }
  const [variantRestockDates, setVariantRestockDates] = useState({}); // { '#hex': 'YYYY-MM-DD' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalogFabricIds, setCatalogFabricIds] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    material_type: '',
    design: '',
    price_per_meter: '',
    stock_quantity: '',
    reorder_level: '100',
    restock_date: '',
    image_url: '',
    width: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSource, setImageSource] = useState('select'); // 'select' or 'upload'

  useEffect(() => {
    fetchFabrics();
    fetchCatalogStatus();
  }, []);

  const fetchCatalogStatus = async () => {
    try {
      const data = await catalogService.getCatalogStatus();
      setCatalogFabricIds(data.fabricIds || []);
    } catch (err) {
      console.error('Error fetching catalog status:', err);
    }
  };

  const fetchFabrics = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics`);
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

    // Validate: at least one color must be selected when adding
    if (!editingFabric && selectedColors.length === 0) {
      alert('Please select at least one color for the fabric.');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingFabric
        ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics/${editingFabric.fabric_id}`
        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics`;

      const method = editingFabric ? 'PUT' : 'POST';

      // If editing, we only update one color. If adding, we may have multiple.
      const colorsToProcess = editingFabric ? [formData.color] : selectedColors;
      
      let successCount = 0;
      let lastError = null;

      for (const color of colorsToProcess) {
        let response;
        // Use individual variant quantity if available, otherwise fallback to main stock_quantity
        const quantityToUse = variantQuantities[color] || formData.stock_quantity;
        const restockDateToUse = variantRestockDates[color] || formData.restock_date;
        const currentFormData = { ...formData, color, stock_quantity: quantityToUse, restock_date: restockDateToUse };

        if (selectedFile) {
          const formDataToSend = new FormData();
          Object.keys(currentFormData).forEach(key => {
            if (currentFormData[key] !== null && currentFormData[key] !== '') {
              formDataToSend.append(key, currentFormData[key]);
            }
          });
          formDataToSend.append('image', selectedFile);

          response = await apiCall(url, {
            method,
            body: formDataToSend,
            headers: {} 
          });
        } else {
          response = await apiCall(url, {
            method,
            body: JSON.stringify(currentFormData)
          });
        }

        if (response.ok) {
          successCount++;
        } else {
          lastError = await response.json();
        }
      }

      if (successCount === colorsToProcess.length) {
        alert(editingFabric ? 'Fabric updated successfully' : `Successfully added ${successCount} fabric variant(s)!`);
        setShowModal(false);
        resetForm();
        fetchFabrics();
      } else {
        alert(lastError?.error || `Failed to process all variants. Successful: ${successCount}`);
      }
    } catch (err) {
      console.error('Error saving fabric:', err);
      alert('Failed to save fabric');
    } finally {
      setIsSubmitting(false);
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
      image_url: fabric.image_url || '',
      width: fabric.width || ''
    });
    setSelectedFile(null);
    setSelectedColors([fabric.color]);
    setImageSource(fabric.image_url?.startsWith('uploads/') ? 'upload' : 'select');
    setShowModal(true);
  };

  const toggleCatalog = async (fabricId) => {
    const isInCatalog = catalogFabricIds.includes(fabricId);
    try {
      if (isInCatalog) {
        await catalogService.removeFromCatalog(fabricId);
        setCatalogFabricIds(prev => prev.filter(id => id !== fabricId));
      } else {
        await catalogService.addToCatalog(fabricId);
        setCatalogFabricIds(prev => [...prev, fabricId]);
      }
    } catch (err) {
      console.error('Error toggling catalog status:', err);
      alert('Failed to update catalog status');
    }
  };

  const handleDelete = async (fabricId) => {
    if (!confirm('Are you sure you want to delete this fabric?')) return;

    try {
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics/${fabricId}`, {
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
      image_url: '',
      width: ''
    });
    setEditingFabric(null);
    setSelectedFile(null);
    setSelectedColors([]);
    setCustomColors([]);
    setVariantQuantities({});
    setVariantRestockDates({});
    setImageSource('select');
  };

  const filteredFabrics = fabrics.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.material_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = colorFilter === 'all' || f.color === colorFilter;
    return matchesSearch && matchesColor;
  });

  const getVariants = (name) => fabrics.filter(f => f.name === name);

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
        <select 
          className="color-filter-select"
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
        >
          <option value="all">Filter by Color</option>
          {FABRIC_COLORS.map(c => (
            <option key={c.hex} value={c.hex}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Fabrics Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Material</th>
              <th>Color</th>
              <th>Width</th>
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
                <td>
                  <div className="variant-dots">
                    {getVariants(fabric.name).map(v => (
                      <div 
                        key={v.fabric_id} 
                        className="variant-dot" 
                        style={{ 
                          backgroundColor: v.color,
                          border: v.fabric_id === fabric.fabric_id ? '2px solid #001a66' : '1px solid #ddd'
                        }}
                        title={`${FABRIC_COLORS.find(c => c.hex === v.color)?.name || 'Custom'}: ${v.stock_quantity}m`}
                      />
                    ))}
                  </div>
                </td>
                <td>{fabric.width || '—'}</td>
                <td>{fabric.design}</td>
                <td>Rs. {Number(fabric.price_per_meter).toFixed(2)}</td>
                <td>
                  <strong>{fabric.stock_quantity} m</strong>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    ({FABRIC_COLORS.find(c => c.hex === fabric.color)?.name || 'Custom'})
                  </div>
                </td>
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

                <div className="form-group full-width">
                  <label>{editingFabric ? 'Fabric Color *' : 'Available Colors * (Select all that apply)'}</label>
                  <div className="color-swatch-grid">
                    {[...FABRIC_COLORS, ...customColors.map(hex => ({ name: 'Custom', hex }))].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.name}
                        onClick={() => {
                          if (editingFabric) {
                            setFormData({ ...formData, color: c.hex });
                          } else {
                            setSelectedColors(prev => 
                              prev.includes(c.hex) 
                                ? prev.filter(h => h !== c.hex) 
                                : [...prev, c.hex]
                            );
                          }
                        }}
                        className={`color-swatch-item ${
                          (editingFabric ? formData.color === c.hex : selectedColors.includes(c.hex)) ? 'selected' : ''
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {(editingFabric ? formData.color === c.hex : selectedColors.includes(c.hex)) && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="custom-color-picker">
                    <label className="text-xs text-gray-500 font-medium">Custom Color Wheel:</label>
                    <input 
                      type="color" 
                      className="color-wheel"
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (editingFabric) {
                          setFormData({ ...formData, color: newColor });
                        } else {
                          // Add to custom list if not already there
                          if (!customColors.includes(newColor)) {
                            setCustomColors(prev => [...prev, newColor]);
                          }
                          // Also select it
                          if (!selectedColors.includes(newColor)) {
                            setSelectedColors(prev => [...prev, newColor]);
                          }
                        }
                      }}
                    />
                    <div 
                      className="color-preview-box" 
                      style={{ 
                        backgroundColor: editingFabric ? formData.color : (selectedColors[selectedColors.length - 1] || '#ffffff') 
                      }}
                      title="Current Pick"
                    />
                  </div>
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
                  <label>Width (e.g. 45", 60")</label>
                  <input
                    type="text"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
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
                  <label>Stock Quantity (Default)</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder={selectedColors.length > 1 ? "Shared default" : "Total meters"}
                  />
                </div>

                {/* Individual Variant Quantities */}
                {!editingFabric && selectedColors.length > 1 && (
                  <div className="form-group full-width variant-quantity-section">
                    <label className="section-label">Set Stock per Color (Meters):</label>
                    <div className="variant-quantity-grid">
                      {selectedColors.map(colorHex => {
                        const colorName = [...FABRIC_COLORS, ...customColors.map(hex => ({ name: 'Custom', hex }))].find(c => c.hex === colorHex)?.name || 'Custom';
                        return (
                          <div key={colorHex} className="variant-quantity-item">
                            <div className="color-preview" style={{ backgroundColor: colorHex }}></div>
                            <span className="color-name">{colorName}</span>
                            <input 
                              type="number" 
                              placeholder="Qty (m)"
                              value={variantQuantities[colorHex] || ''}
                              onChange={(e) => setVariantQuantities({
                                ...variantQuantities,
                                [colorHex]: e.target.value
                              })}
                            />
                            <input
                              type="date"
                              title="Restock Date"
                              value={variantRestockDates[colorHex] || ''}
                              onChange={(e) => setVariantRestockDates({
                                ...variantRestockDates,
                                [colorHex]: e.target.value
                              })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                  <label>Fabric Image</label>
                  <label className="upload-drop-zone">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    {selectedFile ? (
                      <div className="upload-preview">
                        <img src={URL.createObjectURL(selectedFile)} alt="Upload preview" />
                        <span className="upload-filename">{selectedFile.name}</span>
                        <span className="upload-change-hint">Click to change</span>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon">📁</div>
                        <p>Click to browse or drag &amp; drop an image</p>
                        <span>JPG, PNG, WEBP supported</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingFabric ? 'Update' : 'Add')} Fabric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
