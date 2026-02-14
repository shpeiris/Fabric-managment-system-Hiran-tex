import { useState, useEffect } from "react";
import { apiCall } from "@/utils/auth.js";
import "./pages/UserManagement.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [useDefaultPassword, setUseDefaultPassword] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    telephone: "",
    nic: "",
    password: "",
    role: "CUSTOMER",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiCall("http://localhost:5000/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!newUser.full_name.trim())
      newErrors.full_name = "Full name is required";
    if (!newUser.email.trim()) newErrors.email = "Email is required";

    // Validate NIC for staff roles
    if (newUser.role !== "CUSTOMER" && !newUser.nic.trim()) {
      newErrors.nic = "NIC is required for staff";
    }

    // Only validate password if not using default password
    if (!useDefaultPassword) {
      if (!newUser.password.trim()) newErrors.password = "Password is required";
      if (newUser.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Prepare user data - omit password if using default
      const userData = useDefaultPassword
        ? { ...newUser, password: "" } // Send empty password to trigger default generation
        : newUser;

      const response = await apiCall("http://localhost:5000/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers([data.user, ...users]);
        setShowAddForm(false);

        // If a password was generated, show it to the admin
        if (data.isDefaultPassword && data.generatedPassword) {
          setGeneratedPassword(data.generatedPassword);
        }

        // Reset form
        setNewUser({
          full_name: "",
          email: "",
          telephone: "",
          nic: "",
          password: "",
          role: "CUSTOMER",
        });
        setUseDefaultPassword(true);
        setErrors({});

        if (!data.isDefaultPassword) {
          alert("User created successfully!");
        }
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors({ submit: "Network error. Please try again." });
    }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const response = await apiCall(
        `http://localhost:5000/admin/users/${userId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user,
          ),
        );
        alert(`User ${newStatus.toLowerCase()} successfully!`);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (selectedTab === "ALL") return true;
    return user.role === selectedTab;
  });

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }
  return (
    <div className="user-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p className="subtitle">
          Manage user accounts and access roles within the system. Only
          accessible to Admin users.
        </p>
        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          + Add User
        </button>
      </div>

      {/* Add User Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New User</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddUser} className="add-user-form">
              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, full_name: e.target.value })
                    }
                    className={errors.full_name ? "error" : ""}
                  />
                  {errors.full_name && (
                    <span className="field-error">{errors.full_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <span className="field-error">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telephone</label>
                  <input
                    type="text"
                    value={newUser.telephone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, telephone: e.target.value })
                    }
                  />
                </div>

                {newUser.role !== "CUSTOMER" && (
                  <div className="form-group">
                    <label>NIC *</label>
                    <input
                      type="text"
                      value={newUser.nic}
                      onChange={(e) =>
                        setNewUser({ ...newUser, nic: e.target.value })
                      }
                      className={errors.nic ? "error" : ""}
                      placeholder="Required for staff"
                    />
                    {errors.nic && (
                      <span className="field-error">{errors.nic}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="useDefaultPassword"
                      checked={useDefaultPassword}
                      onChange={(e) => {
                        setUseDefaultPassword(e.target.checked);
                        if (e.target.checked) {
                          setNewUser({ ...newUser, password: "" });
                          setErrors({ ...errors, password: undefined });
                        }
                      }}
                    />
                    <label htmlFor="useDefaultPassword">
                      Use default password (recommended)
                    </label>
                  </div>
                  <small className="hint">
                    A secure default password will be generated automatically
                  </small>
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="INVENTORY_MANAGER">Inventory Manager</option>
                    <option value="SALESPERSON">Salesperson</option>
                  </select>
                </div>
              </div>

              {!useDefaultPassword && (
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className={errors.password ? "error" : ""}
                      placeholder="Enter custom password (min 6 characters)"
                    />
                    {errors.password && (
                      <span className="field-error">{errors.password}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Password Modal */}
      {generatedPassword && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="modal-header">
              <h2>✓ User Created Successfully</h2>
            </div>

            <div className="password-display">
              <label>Generated Password:</label>
              <div className="password-box">
                <code>{generatedPassword}</code>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    alert("Password copied to clipboard!");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            <p className="warning-message">
              ⚠️ Please save this password securely. It won't be shown again.
            </p>

            <div className="modal-actions">
              <button
                className="submit-btn"
                onClick={() => setGeneratedPassword(null)}
              >
                I've Saved the Password
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="users-section">
        <h3 className="section-title">User List ({filteredUsers.length})</h3>

        <div className="tabs">
          <button
            className={selectedTab === "ALL" ? "active" : ""}
            onClick={() => setSelectedTab("ALL")}
          >
            All Users
          </button>
          <button
            className={selectedTab === "ADMIN" ? "active" : ""}
            onClick={() => setSelectedTab("ADMIN")}
          >
            Admins
          </button>
          <button
            className={selectedTab === "INVENTORY_MANAGER" ? "active" : ""}
            onClick={() => setSelectedTab("INVENTORY_MANAGER")}
          >
            Inventory Managers
          </button>
          <button
            className={selectedTab === "SALESPERSON" ? "active" : ""}
            onClick={() => setSelectedTab("SALESPERSON")}
          >
            Salesperson
          </button>
          <button
            className={selectedTab === "CUSTOMER" ? "active" : ""}
            onClick={() => setSelectedTab("CUSTOMER")}
          >
            Customers
          </button>
        </div>

        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No users found for the selected filter
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const UserRow = ({ user, onStatusUpdate }) => {
  return (
    <tr>
      <td>{user.full_name}</td>
      <td>{user.email}</td>
      <td>
        <span className={`role-badge ${user.role.toLowerCase()}`}>
          {user.role.replace("_", " ")}
        </span>
      </td>
      <td>
        <span
          className={`status-badge ${user.status ? user.status.toLowerCase() : "active"}`}
        >
          {user.status || "ACTIVE"}
        </span>
      </td>
      <td>{new Date(user.created_at).toLocaleDateString()}</td>
      <td className="actions">
        {user.status !== "INACTIVE" ? (
          <button
            className="action-btn deactivate"
            onClick={() => onStatusUpdate(user.id, "INACTIVE")}
          >
            Deactivate
          </button>
        ) : (
          <button
            className="action-btn activate"
            onClick={() => onStatusUpdate(user.id, "ACTIVE")}
          >
            Activate
          </button>
        )}
      </td>
    </tr>
  );
};
