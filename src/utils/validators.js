// Form validation utility functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email is required";
  }
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateNoteTitle = (title) => {
  if (!title || title.trim() === "") {
    return "Title is required";
  }
  if (title.length > 100) {
    return "Title cannot exceed 100 characters";
  }
  return null;
};

export const validateNoteContent = (content) => {
  if (!content || content.trim() === "") {
    return "Content is required";
  }
  if (content.length > 5000) {
    return "Content cannot exceed 5000 characters";
  }
  return null;
};

export const validateTags = (tags) => {
  if (tags && tags.length > 10) {
    return "Cannot have more than 10 tags";
  }
  return null;
};

// Generic form validation helper
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = values[field];

    if (rule.required && !value) {
      errors[field] = `${rule.label || field} is required`;
    } else if (rule.validator && value) {
      const error = rule.validator(value);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
