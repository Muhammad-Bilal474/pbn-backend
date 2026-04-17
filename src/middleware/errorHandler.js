import { ApiError } from '../utils/helpers.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || [],
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Invalid JSON',
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Validation Error',
      errors,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Invalid ID format',
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: `${field} already exists`,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
  });
};
