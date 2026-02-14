// Validation utility functions for forms

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return "Email is required";
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "Please enter a valid email address";
  }

  return null;
};

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {string|null} Error message or null if valid
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return "Phone number is required";
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, "");

  const regex = /^[0-9]{10}$/;
  if (!regex.test(cleanPhone)) {
    return "Phone number must be 10 digits";
  }

  return null;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special character";
  }

  return null;
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const validateRequired = (value, fieldName = "This field") => {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const validateMinLength = (
  value,
  minLength,
  fieldName = "This field",
) => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const validateMaxLength = (
  value,
  maxLength,
  fieldName = "This field",
) => {
  if (value && value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const validateNumberRange = (
  value,
  min,
  max,
  fieldName = "This field",
) => {
  const num = Number(value);

  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }

  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }

  return null;
};

/**
 * Validate positive number
 * @param {number} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const validatePositiveNumber = (value, fieldName = "This field") => {
  const num = Number(value);

  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }

  if (num <= 0) {
    return `${fieldName} must be a positive number`;
  }

  return null;
};

/**
 * Validate matching passwords
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null if valid
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

/**
 * Validate date is not in the past
 * @param {string} dateString - Date string to validate
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const validateFutureDate = (dateString, fieldName = "Date") => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return `${fieldName} cannot be in the past`;
  }

  return null;
};

/**
 * Validate NIC (Sri Lankan National Identity Card)
 * @param {string} nic - NIC to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateNIC = (nic) => {
  if (!nic || !nic.trim()) {
    return "NIC is required";
  }

  // Old format: 9 digits + V or X
  // New format: 12 digits
  const oldFormat = /^[0-9]{9}[VXvx]$/;
  const newFormat = /^[0-9]{12}$/;

  if (!oldFormat.test(nic) && !newFormat.test(nic)) {
    return "Invalid NIC format (e.g., 123456789V or 123456789012)";
  }

  return null;
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {string|null} Error message or null if valid
 */
export const validateFile = (file, allowedTypes = [], maxSizeMB = 5) => {
  if (!file) {
    return "Please select a file";
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`;
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
};

/**
 * Validate decimal number with precision
 * @param {string|number} value - Value to validate
 * @param {number} maxDecimals - Maximum decimal places
 * @param {string} fieldName - Name of the field
 * @returns {string|null} Error message or null if valid
 */
export const validateDecimal = (
  value,
  maxDecimals = 2,
  fieldName = "This field",
) => {
  const num = Number(value);

  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }

  const decimalPart = value.toString().split(".")[1];
  if (decimalPart && decimalPart.length > maxDecimals) {
    return `${fieldName} can have maximum ${maxDecimals} decimal places`;
  }

  return null;
};
