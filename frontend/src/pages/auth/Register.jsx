import "../register/Register.css";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services";
import { setUser } from "../../utils/auth";
import { useFormValidation } from "../../hooks/useFormValidation";
import registrationImage from "../../assets/Fabrics/registration.png";
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordMatch,
  validateMinLength,
} from "../../utils/validators";

const Register = () => {
  const navigate = useNavigate();

  // Validation rules for each field
  const validationRules = {
    fullName: [
      (val) => validateRequired(val, "Full name"),
      (val) => validateMinLength(val, 2, "Full name"),
    ],
    email: [validateEmail],
    phone: [validatePhone],
    address: [
      (val) => validateRequired(val, "Address"),
      (val) => validateMinLength(val, 10, "Address"),
    ],
    password: [validatePassword],
    confirmPassword: [
      (val) => validateRequired(val, "Confirm password"),
      (val, formData) => validatePasswordMatch(formData?.password || "", val),
    ],
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
  } = useFormValidation(
    {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
    validationRules,
  );

  const onSubmit = async (formData) => {
    try {
      const registrationData = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      };

      const data = await authService.register(registrationData);

      // Save user and token for automatic login
      if (data && data.user) {
        setUser({ ...data.user, token: data.token });
      }

      // Show success and redirect to dashboard
      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      setFieldError(
        "submit",
        error.error || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="register-page">
      <header className="compact-header">
        <div className="sidebar-header">
          <span className="sidebar-logo-icon">🏠</span>
          <span className="sidebar-title">Hiran Fabrics</span>
        </div>
        <Link to="/" className="back-link">
          ← Home
        </Link>
      </header>

      <div className="register-container">
        <div className="register-card-compact">
          {/* Image Side Panel */}
          <div className="image-side-panel">
            <img src={registrationImage} alt="Fabric Collection" />
          </div>

          {/* Form Section */}
          <div className="form-section-compact">
            <div className="form-header">
              <h2>Customer Registration</h2>
              <p>Create your account to start shopping</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="compact-form">
              {errors.submit && (
                <div className="error-msg">✗ {errors.submit}</div>
              )}

              <div className="form-grid">
                <div className="form-group floating-group">
                  <input
                    name="fullName"
                    id="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder=" "
                    className={
                      touched.fullName && errors.fullName ? "error" : ""
                    }
                    disabled={isSubmitting}
                  />
                  <label htmlFor="fullName">Full Name</label>
                  {touched.fullName && errors.fullName && (
                    <span className="field-error">{errors.fullName}</span>
                  )}
                </div>

                <div className="form-group floating-group">
                  <input
                    name="email"
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder=" "
                    className={touched.email && errors.email ? "error" : ""}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="email">Email Address</label>
                  {touched.email && errors.email && (
                    <span className="field-error">{errors.email}</span>
                  )}
                </div>

                <div className="form-group floating-group">
                  <input
                    name="phone"
                    id="phone"
                    type="tel"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder=" "
                    className={touched.phone && errors.phone ? "error" : ""}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="phone">Phone Number</label>
                  {touched.phone && errors.phone && (
                    <span className="field-error">{errors.phone}</span>
                  )}
                </div>

                <div className="form-group floating-group">
                  <input
                    name="address"
                    id="address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder=" "
                    className={touched.address && errors.address ? "error" : ""}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="address">Residential Address</label>
                  {touched.address && errors.address && (
                    <span className="field-error">{errors.address}</span>
                  )}
                </div>

                <div className="form-group floating-group">
                  <input
                    name="password"
                    id="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder=" "
                    className={
                      touched.password && errors.password ? "error" : ""
                    }
                    disabled={isSubmitting}
                  />
                  <label htmlFor="password">Password</label>
                  {touched.password && errors.password && (
                    <span className="field-error">{errors.password}</span>
                  )}
                </div>

                <div className="form-group floating-group">
                  <input
                    name="confirmPassword"
                    id="confirmPassword"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder=" "
                    className={
                      touched.confirmPassword && errors.confirmPassword
                        ? "error"
                        : ""
                    }
                    disabled={isSubmitting}
                  />
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <span className="field-error">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`register-btn-compact ${isSubmitting ? "loading" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Customer Account"
                )}
              </button>

              <div className="auth-links-compact">
                Already have an account? <Link to="/login">Sign In</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
