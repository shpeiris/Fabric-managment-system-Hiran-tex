import { useState, useEffect, useCallback } from 'react';
import { apiCall } from "../../utils/auth.js";
import "./FabricManagement.css";
import { useFormValidation } from "../../hooks/useFormValidation";
import {
  validateRequired,
  validateMinLength,
  validateFabricPrice,
  validateFabricStock,
  validateFabricWidth,
  validateAtLeastOneColor
} from "../../utils/validators";


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
  const [showModal, setShowModal] = useState(false);
  const [editingFabric, setEditingFabric] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [customColors, setCustomColors] = useState([]); 
  const [variantQuantities, setVariantQuantities] = useState({}); 
  const [variantRestockDates, setVariantRestockDates] = useState({}); // { '#hex': 'YYYY-MM-DD' }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  // Validation rules
  const validationRules = {
    name: [
      (val) => validateRequired(val, "Fabric Name"),
      (val) => validateMinLength(val, 3, "Fabric Name"),
    ],
    material_type: [(val) => validateRequired(val, "Material Type")],
    price_per_meter: [validateFabricPrice],
    stock_quantity: [validateFabricStock],
    reorder_level: [(val) => validateFabricStock(val)], // Reorder level follows stock rules
    width: [validateFabricWidth],
    selectedColors: [
      (val, formData) => !editingFabric ? validateAtLeastOneColor(val) : null
    ]
  };

  const {
    values,
    errors,
    touched,
    isSubmitting: isFormSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleValidatedSubmit,
    setFieldValue,
    setValues,
    resetForm: resetValidationForm,
    setFieldError
  } = useFormValidation(
    {
      name: '',
      material_type: '',
      design: '',
      price_per_meter: '',
      stock_quantity: '',
      reorder_level: '100',
      restock_date: '',
      image_url: '',
      width: '',
      selectedColors: []
    },
    validationRules
  );

  useEffect(() => {
    fetchFabrics();
  }, []);

  const fetchFabrics = async () => {
    try {
      const response = await apiCall(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics`);
      const data = await response.json();

      if (response.ok) {
        setFabrics(data.fabrics || []);
      }
    } catch (err) {
      console.error('Error fetching fabrics:', err);
      alert('Failed to load fabrics');
    }
  };

  const handleSubmit = async (formValues) => {
    try {
      setIsSubmitting(true);
      const url = editingFabric
        ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics/${editingFabric.fabric_id}`
        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/inventory/fabrics`;

      const method = editingFabric ? 'PUT' : 'POST';

      // If editing, we only update one color. If adding, we may have multiple.
      const colorsToProcess = editingFabric ? [editingFabric.color] : values.selectedColors;
      
      let successCount = 0;
      let lastError = null;

      for (const color of colorsToProcess) {
        let response;
        // Use individual variant quantity if available, otherwise fallback to main stock_quantity
        const quantityToUse = variantQuantities[color] || formValues.stock_quantity;
        const restockDateToUse = variantRestockDates[color] || formValues.restock_date;
        const currentFormData = { ...formValues, color, stock_quantity: quantityToUse, restock_date: restockDateToUse };
        // Remove helper field before sending to API
        delete currentFormData.selectedColors;

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
        // We'll use a local state for success message instead of alert if we were going full toast, 
        // but for now let's at least keep completion alerts or move to a message in the modal.
        alert(editingFabric ? 'Fabric updated successfully' : `Successfully added ${successCount} fabric variant(s)!`);
        setShowModal(false);
        resetForm();
        fetchFabrics();
      } else {
        setFieldError('submit', lastError?.error || `Failed to process all variants. Successful: ${successCount}`);
      }
    } catch (err) {
      console.error('Error saving fabric:', err);
      setFieldError('submit', 'Failed to save fabric');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleEdit = (fabric) => {
    setEditingFabric(fabric);
    const editValues = {
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
      width: fabric.width || '',
      selectedColors: [fabric.color]
    };
    setValues(editValues);
    setSelectedFile(null);
    setShowModal(true);
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
    resetValidationForm();
    setEditingFabric(null);
    setSelectedFile(null);
    setCustomColors([]);
    setVariantQuantities({});
    setVariantRestockDates({});
  };

  const filteredFabrics = fabrics.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.material_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = colorFilter === 'all' || f.color === colorFilter;
    return matchesSearch && matchesColor;
  });

  const getVariants = useCallback((name) => fabrics.filter(f => f.name === name), [fabrics]);

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

            <form onSubmit={handleValidatedSubmit(handleSubmit)}>
              {errors.submit && <div className="error-msg-banner">✗ {errors.submit}</div>}

              <div className="form-grid">
                <div className={`form-group ${touched.name && errors.name ? 'has-error' : ''}`}>
                  <label>Fabric Name *</label>
                  <input
                    name="name"
                    type="text"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.name && errors.name ? 'error' : ''}
                  />
                  {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className={`form-group ${touched.material_type && errors.material_type ? 'has-error' : ''}`}>
                  <label>Material Type *</label>
                  <input
                    name="material_type"
                    type="text"
                    value={values.material_type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.material_type && errors.material_type ? 'error' : ''}
                  />
                  {touched.material_type && errors.material_type && <span className="field-error">{errors.material_type}</span>}
                </div>

                <div className={`form-group full-width ${touched.selectedColors && errors.selectedColors ? 'has-error' : ''}`}>
                  <label>{editingFabric ? 'Fabric Color *' : 'Available Colors * (Select all that apply)'}</label>
                  <div className="color-swatch-grid">
                    {[...FABRIC_COLORS, ...customColors.map(hex => ({ name: 'Custom', hex }))].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.name}
                        onClick={() => {
                          if (editingFabric) {
                            setFieldValue('color', c.hex);
                          } else {
                            const newColors = values.selectedColors.includes(c.hex) 
                              ? values.selectedColors.filter(h => h !== c.hex) 
                              : [...values.selectedColors, c.hex];
                            setFieldValue('selectedColors', newColors);
                          }
                        }}
                        className={`color-swatch-item ${
                          (editingFabric ? values.color === c.hex : values.selectedColors.includes(c.hex)) ? 'selected' : ''
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {(editingFabric ? values.color === c.hex : values.selectedColors.includes(c.hex)) && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {touched.selectedColors && errors.selectedColors && <span className="field-error">{errors.selectedColors}</span>}
                   <div className="custom-color-picker">
                    <label className="text-xs text-gray-500 font-medium">Custom Color Wheel:</label>
                    <input 
                      type="color" 
                      className="color-wheel"
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (editingFabric) {
                          setFieldValue('color', newColor);
                        } else {
                          // Add to custom list if not already there
                          if (!customColors.includes(newColor)) {
                            setCustomColors(prev => [...prev, newColor]);
                          }
                          // Also select it
                          if (!values.selectedColors.includes(newColor)) {
                            setFieldValue('selectedColors', [...values.selectedColors, newColor]);
                          }
                        }
                      }}
                    />
                    <div 
                      className="color-preview-box" 
                      style={{ 
                        backgroundColor: editingFabric ? values.color : (values.selectedColors[values.selectedColors.length - 1] || '#ffffff') 
                      }}
                      title="Current Pick"
                    />
                  </div>
                </div>


                <div className="form-group">
                  <label>Design</label>
                  <input
                    name="design"
                    type="text"
                    value={values.design}
                    onChange={handleChange}
                  />
                </div>

                <div className={`form-group ${touched.width && errors.width ? 'has-error' : ''}`}>
                  <label>Width (e.g. 45", 60")</label>
                  <input
                    name="width"
                    type="text"
                    value={values.width}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.width && errors.width ? 'error' : ''}
                  />
                  {touched.width && errors.width && <span className="field-error">{errors.width}</span>}
                </div>

                <div className={`form-group ${touched.price_per_meter && errors.price_per_meter ? 'has-error' : ''}`}>
                  <label>Price per Meter *</label>
                  <input
                    name="price_per_meter"
                    type="number"
                    step="0.01"
                    value={values.price_per_meter}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.price_per_meter && errors.price_per_meter ? 'error' : ''}
                  />
                  {touched.price_per_meter && errors.price_per_meter && <span className="field-error">{errors.price_per_meter}</span>}
                </div>

                <div className={`form-group ${touched.stock_quantity && errors.stock_quantity ? 'has-error' : ''}`}>
                  <label>Stock Quantity (Default)</label>
                  <input
                    name="stock_quantity"
                    type="number"
                    value={values.stock_quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={values.selectedColors.length > 1 ? "Shared default" : "Total meters"}
                    className={touched.stock_quantity && errors.stock_quantity ? 'error' : ''}
                  />
                  {touched.stock_quantity && errors.stock_quantity && <span className="field-error">{errors.stock_quantity}</span>}
                </div>

                {/* Individual Variant Quantities */}
                {!editingFabric && values.selectedColors.length > 1 && (
                  <div className="form-group full-width variant-quantity-section">
                    <label className="section-label">Set Stock per Color (Meters):</label>
                    <div className="variant-quantity-grid">
                      {values.selectedColors.map(colorHex => {
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

                <div className={`form-group ${touched.reorder_level && errors.reorder_level ? 'has-error' : ''}`}>
                  <label>Reorder Level</label>
                  <input
                    name="reorder_level"
                    type="number"
                    value={values.reorder_level}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.reorder_level && errors.reorder_level ? 'error' : ''}
                  />
                  {touched.reorder_level && errors.reorder_level && <span className="field-error">{errors.reorder_level}</span>}
                </div>

                <div className="form-group">
                  <label>Restock Date</label>
                  <input
                    name="restock_date"
                    type="date"
                    value={values.restock_date}
                    onChange={handleChange}
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
                <button type="submit" className="btn-save" disabled={isFormSubmitting}>
                  {(isSubmitting || isFormSubmitting) ? 'Saving...' : (editingFabric ? 'Update' : 'Add')} Fabric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}