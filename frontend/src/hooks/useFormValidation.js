// Custom React hook for form validation
import { useState, useCallback } from "react";
import {
  validateForm,
  validateField,
  clearFieldError,
  hasErrors,
} from "../utils/formValidation";

/**
 * Custom hook for form validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Form state and handlers
 */
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Clear error when user starts typing
      if (touched[name]) {
        setErrors((prev) => clearFieldError(prev, name));
      }
    },
    [touched],
  );

  /**
   * Handle field blur (validate on blur)
   */
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate field on blur
      if (validationRules[name]) {
        const error = validateField(
          name,
          values[name],
          validationRules[name],
          values,
        );
        setErrors((prev) => ({
          ...prev,
          [name]: error || undefined,
        }));
      }
    },
    [values, validationRules],
  );

  /**
   * Validate entire form
   */
  const validate = useCallback(() => {
    const formErrors = validateForm(values, validationRules);
    setErrors(formErrors);
    return !hasErrors(formErrors);
  }, [values, validationRules]);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(
    (onSubmit) => {
      return async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Mark all fields as touched
        const allTouched = Object.keys(validationRules).reduce(
          (acc, key) => ({
            ...acc,
            [key]: true,
          }),
          {},
        );
        setTouched(allTouched);

        // Validate form
        const isValid = validate();

        if (isValid) {
          try {
            await onSubmit(values);
          } catch (error) {
            console.error("Form submission error:", error);
          }
        }

        setIsSubmitting(false);
      };
    },
    [values, validate, validationRules],
  );

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Set a specific field value
   */
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set a specific field error
   */
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validate,
    setValues,
    setErrors,
  };
};
