import "./Forgot.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const trimmedEmail = email.trim();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      // Persist email for the next steps (in case of refresh)
      localStorage.setItem('resetEmail', trimmedEmail);

      // Navigate to reset sent page and pass the email
      navigate('/reset-sent', { state: { email: trimmedEmail } });
    } catch (error) {
      console.error('Password reset request failed:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
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
          <p>Password Recovery</p>
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-box" style={{ maxWidth: "480px" }}>
          <h2 style={{ fontSize: "28px", color: "#001a66", fontWeight: "800", marginBottom: "12px" }}>Forgot Your Password?</h2>
          <p className="subtitle" style={{ color: "#64748b", lineHeight: "1.6", marginBottom: "24px" }}>
            Enter your email address and we'll send you a 6-digit code to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group" style={{ marginBottom: "20px" }}>
              <label style={{ color: "#475569", fontWeight: "700", display: "block", marginBottom: "8px", fontSize: "14px" }}>Email Address</label>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border: "2px solid #e2e8f0",
                  width: "100%",
                  boxSizing: "border-box",
                  fontSize: "16px",
                  outline: "none"
                }}
                className={error ? 'error' : ''}
                required
              />
              {error && <span className="error-message" style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px", display: "block" }}>{error}</span>}
            </div>

            <button
              type="submit"
              className={`primary-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "#001a66",
                color: "white",
                border: "none",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 26, 102, 0.2)"
              }}
            >
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>

          <div style={{ marginTop: "24px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
            <Link to="/login" className="secondary-btn" style={{ textDecoration: "none", color: "#64748b", fontSize: "14px", fontWeight: "600" }}>
              ← Return to Login
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
