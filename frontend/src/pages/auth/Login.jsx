import "./Login.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { setUser, getRedirectPath } from "../../utils/auth.js";
import { authService } from "../../services";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear errors as user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Use authService instead of direct fetch
      const data = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // Login successful - store user data
      setUser(data.user);

      console.log("Login successful:", data);

      // Get redirect path from server response or calculate based on role
      const redirectPath = data.redirectTo || getRedirectPath(data.user.role);

      // Check if user was trying to access a protected route
      const from = location.state?.from?.pathname || redirectPath;

      // Navigate to appropriate dashboard
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: error.error || "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="top-bar">
        <div className="logo">
          <span className="home-icon">🏠</span>
          <h1>Hiran Fabric Textile</h1>
        </div>
      </header>

      {/* Login Card */}
      <div className="login-container">
        <div className="login-box">
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to access your dashboard</p>

          <div className="login-content">
            {/* Left - Login Form */}
            <div className="login-form">
              <form onSubmit={handleSubmit}>
                {errors.submit && (
                  <div className="error-message">✗ {errors.submit}</div>
                )}

                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "error" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <span className="field-error">{errors.email}</span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? "error" : ""}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <span className="field-error">{errors.password}</span>
                  )}
                </div>

                <div className="options">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rememberMe: e.target.checked,
                        })
                      }
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot" className="forgot-link">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className={`login-btn ${isLoading ? "loading" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <p className="signup-text">
                Don't have an account?{" "}
                <Link to="/register">Sign up as Customer</Link>
              </p>
            </div>

            {/* Right - Role Information */}
            <div className="role-box">
              <p className="role-title">Available Roles</p>
              <p className="role-description">
                Login with your assigned role credentials
              </p>

              <div className="role-list">
                <div className="role-item customer">
                  <span className="role-icon">👤</span>
                  <div className="role-info">
                    <span className="role-name">Customer</span>
                    <span className="role-access">Browse & Shop</span>
                  </div>
                </div>

                <div className="role-item admin">
                  <span className="role-icon">👑</span>
                  <div className="role-info">
                    <span className="role-name">Admin</span>
                    <span className="role-access">Full Access</span>
                  </div>
                </div>

                <div className="role-item inventory">
                  <span className="role-icon">📦</span>
                  <div className="role-info">
                    <span className="role-name">Inventory Manager</span>
                    <span className="role-access">Stock Management</span>
                  </div>
                </div>

                <div className="role-item sales">
                  <span className="role-icon">💼</span>
                  <div className="role-info">
                    <span className="role-name">Sales Person</span>
                    <span className="role-access">Sales & Orders</span>
                  </div>
                </div>
              </div>

              <div className="role-note">
                <small>Employee accounts are created by administrators</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Banner */}
      <div className="image-banner">
        <img src="/fabrics.jpg" alt="Fabric rolls" />
      </div>
    </div>
  );
}
