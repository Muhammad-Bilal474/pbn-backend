import { body, validationResult } from 'express-validator';
import { ApiError } from '../utils/helpers.js';

export const validateLoginRequest = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateUserCreation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
];

export const validateSheetUpload = [
  body('siteName').trim().notEmpty().withMessage('Site name is required'),
  body('siteUrl')
    .isURL()
    .withMessage('Valid URL is required'),
  body('type')
    .isIn(['WORDPRESS', 'CUSTOM', 'WOO_COMMERCE'])
    .withMessage('Invalid site type'),
];

export const validatePostCreation = [
  body('keywords').isArray().withMessage('Keywords must be an array'),
  body('selectedSites').isArray().withMessage('Selected sites must be an array'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));
    throw new ApiError(400, 'Validation failed', formattedErrors);
  }
  next();
};
