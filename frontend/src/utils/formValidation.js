// Form validation helper functions

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field
 * @param {any} value - Value to validate
 * @param {Array<Function>} rules - Array of validation functions
 * @param {Object} formData - Entire form data (optional)
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (fieldName, value, rules, formData = {}) => {
  for (const rule of rules) {
    // Pass value, formData, and fieldName to the rule
    const error = rule(value, formData, fieldName);
    if (error) {
      return error;
    }
  }
  return null;
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((fieldName) => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];

    const error = validateField(fieldName, value, rules, formData);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Check if form has any errors
 * @param {Object} errors - Errors object from validateForm
 * @returns {boolean} True if there are errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error message
 * @param {Object} errors - Errors object
 * @returns {string|null} First error message or null
 */
export const getFirstError = (errors) => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};

/**
 * Clear error for a specific field
 * @param {Object} errors - Current errors object
 * @param {string} fieldName - Field name to clear
 * @returns {Object} New errors object without the cleared field
 */
export const clearFieldError = (errors, fieldName) => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

/**
 * Validate form on submit
 * @param {Object} formData - Form data
 * @param {Object} validationRules - Validation rules
 * @param {Function} setErrors - Function to set errors state
 * @returns {boolean} True if form is valid
 */
export const validateOnSubmit = (formData, validationRules, setErrors) => {
  const errors = validateForm(formData, validationRules);
  setErrors(errors);
  return !hasErrors(errors);
};

/**
 * Validate field on blur
 * @param {string} fieldName - Field name
 * @param {any} value - Field value
 * @param {Array<Function>} rules - Validation rules
 * @param {Function} setErrors - Function to set errors state
 */
export const validateOnBlur = (fieldName, value, rules, setErrors) => {
  const error = validateField(fieldName, value, rules);
  setErrors((prevErrors) => ({
    ...prevErrors,
    [fieldName]: error || undefined,
  }));
};

/**
 * Clear error on change
 * @param {string} fieldName - Field name
 * @param {Function} setErrors - Function to set errors state
 */
export const clearErrorOnChange = (fieldName, setErrors) => {
  setErrors((prevErrors) => clearFieldError(prevErrors, fieldName));
};
