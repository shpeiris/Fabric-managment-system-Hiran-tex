import "./Login.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { setUser, getRedirectPath } from "../../utils/auth.js";
import { authService } from "../../services";
import loginImage from "../../assets/Fabrics/login.png";

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
        email: formData.email.trim(),
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
      {/* Header - Matching other pages */}
      <header className="top-bar">
        <div className="sidebar-header">
          <span className="sidebar-logo-icon">🏠</span>
          <span className="sidebar-title">Hiran Fabrics</span>
        </div>
      </header>

      {/* Login Card */}
      <div className="login-container">
        <div className="login-box">
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to access your dashboard</p>

          <div className="login-content">
            {/* Image Side Panel */}
            <div className="image-side-panel">
              <img src={loginImage} alt="Luxury Fabrics" />
            </div>

            {/* Form Wrapper */}
            <div className="login-form-wrapper">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
