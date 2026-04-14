import { useState, useEffect } from "react";
import { supplierService } from "../../../services";
import { useFormValidation } from "../../../hooks/useFormValidation";
import {
  validateRequired,
  validateMinLength,
  validateEmail,
  validatePhone
} from "../../../utils/validators";

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Validation rules
  const validationRules = {
    name: [
      (val) => validateRequired(val, "Company Name"),
      (val) => validateMinLength(val, 3, "Company Name"),
    ],
    contact_person: [(val) => validateRequired(val, "Contact Person")],
    contact_number: [validatePhone],
    email: [validateEmail],
  };

  const {
    values,
    errors,
    touched,
    isSubmitting: isFormSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: handleValidatedSubmit,
    setValues,
    resetForm: resetValidationForm,
    setFieldError
  } = useFormValidation(
    {
      name: "",
      contact_person: "",
      contact_number: "",
      email: "",
      address: "",
    },
    validationRules
  );

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(data);
      setError(null);
    } catch (err) {
      setError("Failed to load suppliers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await supplierService.delete(id);
        fetchSuppliers();
      } catch (err) {
        setFieldError('submit', "Failed to delete supplier");
        console.error(err);
      }
    }
  };

  const handleAddSubmit = async (formValues) => {
    try {
      await supplierService.create(formValues);
      setShowAddModal(false);
      resetValidationForm();
      fetchSuppliers();
    } catch (err) {
      setFieldError('submit', "Failed to add supplier");
      console.error(err);
    }
  };

  const handleEditSubmit = async (formValues) => {
    try {
      await supplierService.update(selectedSupplier.supplier_id, formValues);
      setShowEditModal(false);
      setSelectedSupplier(null);
      resetValidationForm();
      fetchSuppliers();
    } catch (err) {
      setFieldError('submit', "Failed to update supplier");
      console.error(err);
    }
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setValues({
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      contact_number: supplier.contact_number || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setShowEditModal(true);
  };
  
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supplier_id.toString().includes(searchTerm) ||
    s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return <div style={{ padding: "20px" }}>Loading suppliers...</div>;
  if (error)
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "16px" }}>
        Supplier Management
      </h2>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          padding: "16px",
        }}
      >
        {/* Header & Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ color: "#4b5563" }}>
            Total Suppliers:{" "}
            <span style={{ fontWeight: "bold", color: "#2563eb" }}>
              {suppliers.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "14px",
                  width: "250px",
                  outline: "none"
                }}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onClick={() => {
              resetValidationForm();
              setShowAddModal(true);
            }}
          >
            + Add New Supplier
          </button>
        </div>
      </div>

        {/* Suppliers Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <th
                  style={{
                    padding: "12px",
                    fontWeight: "500",
                    color: "#4b5563",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "12px",
                    fontWeight: "500",
                    color: "#4b5563",
                  }}
                >
                  Company Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    fontWeight: "500",
                    color: "#4b5563",
                  }}
                >
                  Contact Person
                </th>
                <th
                  style={{
                    padding: "12px",
                    fontWeight: "500",
                    color: "#4b5563",
                  }}
                >
                  Phone
                </th>
                <th
                  style={{
                    padding: "12px",
                    fontWeight: "500",
                    color: "#4b5563",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "12px",
                    fontWeight: "500",
                    color: "#4b5563",
                  }}
                >
                  Address
                </th>
                <th
                  style={{
                    padding: "12px",
                    fontWeight: "500",
                    color: "#4b5563",
                    textAlign: "right",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    {searchTerm ? "No suppliers match your search." : "No suppliers found. Add one to get started."}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.supplier_id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: "12px", color: "#6b7280" }}>
                      #{supplier.supplier_id}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "500",
                        color: "#2563eb",
                      }}
                    >
                      {supplier.name}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {supplier.contact_person || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {supplier.contact_number || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{supplier.email || "-"}</td>
                    <td
                      style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#4b5563",
                        maxWidth: "200px",
                      }}
                      title={supplier.address}
                    >
                      {supplier.address || "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button
                        style={{
                          color: "#2563eb",
                          marginRight: "12px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                        onClick={() => openEditModal(supplier)}
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          color: "#dc2626",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                        onClick={() => handleDelete(supplier.supplier_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "450px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Add New Supplier
            </h3>
            <form onSubmit={handleValidatedSubmit(handleAddSubmit)}>
              {errors.submit && <div className="error-msg-banner">✗ {errors.submit}</div>}

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Company Name *
                </label>
                <input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: touched.name && errors.name ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                  placeholder="Enter supplier name"
                />
                {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Contact Person
                </label>
                <input
                  name="contact_person"
                  value={values.contact_person}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: touched.contact_person && errors.contact_person ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                  placeholder="Contact person name"
                />
                {touched.contact_person && errors.contact_person && <span className="field-error">{errors.contact_person}</span>}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Phone
                </label>
                <input
                  name="contact_number"
                  value={values.contact_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: touched.contact_number && errors.contact_number ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                  placeholder="Phone number"
                />
                {touched.contact_number && errors.contact_number && <span className="field-error">{errors.contact_number}</span>}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: touched.email && errors.email ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                  placeholder="Email address"
                />
                {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Address
                </label>
                <textarea
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                  placeholder="Full address"
                  rows="3"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  paddingTop: "8px",
                }}
              >
                <button
                  type="button"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#e5e7eb",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: isFormSubmitting ? "#94a3b8" : "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isFormSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isFormSubmitting ? "Adding..." : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditModal && selectedSupplier && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              width: "100%",
              maxWidth: "450px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Edit Supplier
            </h3>
            <form onSubmit={handleValidatedSubmit(handleEditSubmit)}>
              {errors.submit && <div className="error-msg-banner">✗ {errors.submit}</div>}

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Company Name *
                </label>
                <input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: touched.name && errors.name ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                />
                {touched.name && errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Contact Person
                </label>
                <input
                  name="contact_person"
                  value={values.contact_person}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: touched.contact_person && errors.contact_person ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                />
                {touched.contact_person && errors.contact_person && <span className="field-error">{errors.contact_person}</span>}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Phone
                </label>
                <input
                  name="contact_number"
                  value={values.contact_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: touched.contact_number && errors.contact_number ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                />
                {touched.contact_number && errors.contact_number && <span className="field-error">{errors.contact_number}</span>}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: touched.email && errors.email ? "1px solid #ef4444" : "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                />
                {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  Address
                </label>
                <textarea
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    padding: "8px",
                    borderRadius: "4px",
                    outline: "none"
                  }}
                  rows="3"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  paddingTop: "8px",
                }}
              >
                <button
                  type="button"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#e5e7eb",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: isFormSubmitting ? "#94a3b8" : "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isFormSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  {isFormSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
