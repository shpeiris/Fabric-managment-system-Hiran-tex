import "./Forgot.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function PasswordResetSuccess() {
  useEffect(() => {
    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="header-content">
          <span className="home-icon">🏠</span>
          <h1>Hiran Fabric Textile</h1>
          <p>Password Successfully Reset</p>
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-box">
          <div className="success-icon">
            ✅
          </div>

          <h2>Password Reset Complete!</h2>

          <p className="info-text">
            Your password has been successfully updated. You can now log in with your new password.
          </p>

          <div className="success-message">
            <h4>What's Next?</h4>
            <ul>
              <li>Use your new password to log in</li>
              <li>Keep your password secure</li>
              <li>Consider enabling two-factor authentication</li>
            </ul>
          </div>

          <div className="auto-redirect">
            <p>You will be redirected to the login page in 5 seconds...</p>
          </div>

          <div className="action-buttons">
            <Link to="/login" className="primary-btn">
              Go to Login Now
            </Link>
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
