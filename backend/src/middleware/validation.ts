import { body } from 'express-validator';

export const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['volunteer', 'ngo_admin'])
    .withMessage('Role must be either volunteer or ngo_admin'),

  body('phone')
    .optional()
    .trim(),

  body('organizationName')
    .optional()
    .trim(),

  body('organizationType')
    .optional()
    .trim(),

  body('skills')
    .optional()
    .custom((value) => {
      // Handle both array and string (from FormData) cases
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return true; // Allow simple strings too
        }
      }
      return false;
    })
    .withMessage('Skills must be a valid array or string'),

  body('interests')
    .optional()
    .custom((value) => {
      // Handle both array and string (from FormData) cases
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return true; // Allow simple strings too
        }
      }
      return false;
    })
    .withMessage('Interests must be a valid array or string')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('location.address')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Address cannot exceed 300 characters'),

  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  body('location.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),

  body('location.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),

  body('organizationName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Organization name must be between 2 and 200 characters'),

  body('organizationType')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization type cannot exceed 100 characters'),

  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];
