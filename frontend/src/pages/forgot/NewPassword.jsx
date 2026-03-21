import "./Forgot.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function NewPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors as user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const { state } = useLocation();
  const email = state?.email || localStorage.getItem('resetEmail');
  const otp = state?.otp || localStorage.getItem('resetOtp');

  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot");
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          newPassword: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Success! Clear the persistence data
      localStorage.removeItem('resetEmail');
      localStorage.removeItem('resetOtp');

      navigate('/password-reset-success');
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrors({ submit: error.message || 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="header-content">
          <span className="home-icon">🏠</span>
          <h1>Hiran Fabric Textile</h1>
          <p>Create New Password</p>
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-box">
          <div className="security-icon">
            🔒
          </div>

          <h2>Set New Password</h2>
          <p className="subtitle">Choose a strong password to secure your account</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>New Password</label>
              <div className="password-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  className={errors.password ? 'error' : ''}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-field">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  className={errors.confirmPassword ? 'error' : ''}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </span>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={formData.password.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
                <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>One uppercase letter</li>
                <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>One lowercase letter</li>
                <li className={/\d/.test(formData.password) ? 'valid' : ''}>One number</li>
              </ul>
            </div>

            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

            <button
              type="submit"
              className={`primary-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <Link to="/" className="secondary-btn">
            Back to Login
          </Link>
        </div>
      </div>

      {/* Image Banner */}
      <div className="image-banner">
        <img src="/fabrics.jpg" alt="Fabric rolls" />
      </div>
    </div>
  );
}
