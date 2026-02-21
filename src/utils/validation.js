export const validateEmail = (email) => {
  if (!email) return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? null : 'Invalid email address';
};

export const validatePhone = (phone) => {
  if (!phone) return null;
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/\D/g, '')) ? null : 'Phone must be 10 digits';
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return null;
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return re.test(gstin.toUpperCase()) ? null : 'Invalid GSTIN format (15 characters)';
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateNumber = (value, fieldName = 'This field', min = null, max = null) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (min !== null && num < min) return `${fieldName} must be at least ${min}`;
  if (max !== null && num > max) return `${fieldName} must be at most ${max}`;
  return null;
};

export const validatePositiveNumber = (value, fieldName = 'This field') => {
  return validateNumber(value, fieldName, 0);
};

export const validatePassword = (password, minLength = 6) => {
  if (!password) return 'Password is required';
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  return null;
};

export const validateMobile = (mobile) => {
  if (!mobile) return 'Mobile number is required';
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length !== 10) return 'Mobile number must be 10 digits';
  return null;
};
