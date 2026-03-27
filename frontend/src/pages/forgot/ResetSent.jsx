import "./Forgot.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

export default function ResetSent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const email = location.state?.email || localStorage.getItem('resetEmail');
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/forgot");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setTimeLeft(300);
        setCanResend(false);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Server error while resending OTP");
    }
  };

  const handleVerify = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Persist OTP for the next step
      localStorage.setItem('resetOtp', otp);

      // Navigate to new password page and pass email and otp
      navigate('/new-password', { state: { email, otp } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [email, otp, navigate]);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp, handleVerify]);
  // Added handleVerify to dependency array for correctness

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
          <div className="success-icon" style={{ fontSize: "40px", marginBottom: "20px" }}>🔑</div>

          <h2 style={{ fontSize: "24px", color: "#001a66", fontWeight: "800", marginBottom: "12px" }}>Enter Verification Code</h2>

          <p className="info-text" style={{ color: "#64748b", lineHeight: "1.6", marginBottom: "24px" }}>
            We've sent a 6-digit code to <strong>{email}</strong>.<br />
            Please check your <strong>inbox</strong> (and spam folder) to find the code.
          </p>

          <form onSubmit={handleVerify}>
            <div className="input-group">
              <label style={{ color: "#475569", fontWeight: "700", display: "block", marginBottom: "10px", fontSize: "14px" }}>6-Digit OTP Code</label>
              <input
                type="text"
                maxLength="6"
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                style={{
                  textAlign: "center",
                  fontSize: "32px",
                  letterSpacing: "12px",
                  fontWeight: "900",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "2px solid #e2e8f0",
                  color: "#001a66",
                  background: "#f8fafc",
                  outline: "none",
                  transition: "border-color 0.3s",
                  width: "100%",
                  boxSizing: "border-box"
                }}
                className={error ? 'error' : ''}
                required
              />
              {error && <span className="error-message" style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px", display: "block", fontWeight: "600" }}>{error}</span>}
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
                marginTop: "10px",
                boxShadow: "0 4px 15px rgba(0, 26, 102, 0.2)"
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="timer-section" style={{ marginTop: "24px" }}>
            {!canResend ? (
              <p className="timer-text" style={{ fontSize: "14px", color: "#64748b" }}>
                Didn't get the code? Resend in <span style={{ color: "#001a66", fontWeight: "700" }}>{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button className="resend-btn" onClick={handleResend} style={{ color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>
                Resend Code
              </button>
            )}
          </div>

          <div className="action-buttons" style={{ marginTop: "32px", borderTop: "1px solid #f1f5f9", paddingTop: "24px" }}>
            <Link to="/forgot" className="secondary-btn" style={{ textDecoration: "none", color: "#64748b", fontSize: "14px", fontWeight: "600" }}>
              ← Use a different email address
            </Link>
          </div>
        </div>
      </div>

      <div className="image-banner">
        <img src="/fabrics.jpg" alt="Fabric rolls" />
      </div>
    </div>
  );
}
