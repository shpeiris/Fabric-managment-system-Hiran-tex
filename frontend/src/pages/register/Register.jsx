import "../register/Register.css";
import { Link, useNavigate } from "react-router-dom";// React Router to move the user to different pages
import { authService } from "../../services";// used to contact the backend to register the user and save their login session
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
  // Hook from React Router to redirect the user to a different page 
  const navigate = useNavigate();

  // 1. Validation rules for each field in the form
  // These make sure the user inputs the correct type and length of information.
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

  // 2. Custom Form Hook Setup
  // manages what the user types ('values'), checks for mistakes ('errors'),
  // tracks if they are currently submitting to the database ('isSubmitting'), 
  // and checks if they've clicked in and out of an input box .
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

  // 3. User submission logic - runs when the "Create Customer Account" button is clicked
  const onSubmit = async (formData) => {
    try {
      // Gather up the actual values the user typed to match what the backend expects
      const registrationData = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      };

      // 4. Send exactly what the user typed to the backend API (`/api/auth/register`)
      const data = await authService.register(registrationData);

      // 5. Automatically log the newly registered user in
      // This saves the new user 
      if (data && data.user) {
        setUser({ ...data.user, token: data.token });
      }

      // 6. Give the browser 1 second, then teleport the user to the Customer Dashboard successfully.
      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 1000);
    } catch (error) {
      // If the backend refuses their registration (e.g. Email is already taken), log the error and show it
      console.error("Registration error:", error);
      setFieldError(
        "submit",
        error.error || "Registration failed. Please try again.",
      );
    }
  };

  // 7. This HTML represents the UI of the Registration component that the user actually sees on screen.
  return (
    <div className="register-page">
      {/* Header - Matching other pages */}
      <header className="top-bar">
        <Link to="/" className="sidebar-header" style={{ textDecoration: 'none' }}>
          <span className="sidebar-logo-icon">🏠</span>
          <span className="sidebar-title">Hiran Fabric Textile</span>
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

            {/* This `<form>` runs our custom function `handleSubmit(onSubmit)` completely overriding normal browser refreshes. */}
            <form onSubmit={handleSubmit(onSubmit)} className="compact-form">
              
              {/* Show the Big "Server Error" message if anything went wrong upon submit (like wrong email format) */}
              {errors.submit && (
                <div className="error-msg">✗ {errors.submit}</div>
              )}

              <div className="form-grid">
                
                {/* 1. Full Name Input Group */}
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
                  
                  {/* Checks to see if the user clicked into the box (touched) AND if they got it wrong (errors > validateRequired/validateMinLength) */}
                  {touched.fullName && errors.fullName && (
                    <span className="field-error">{errors.fullName}</span>
                  )}
                </div>

                {/* 2. Email Address Input Group */}
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

              {/* Dynamic submit button: If loading = show spinner 'Creating Account...' / If NOT = 'Create Customer Account' */}
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
