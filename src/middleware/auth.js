import jwtUtil from '../utils/jwt.js';
import { ApiError, asyncHandler } from '../utils/helpers.js';
import User from '../models/User.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'No authentication token provided');
  }

  const decoded = jwtUtil.verifyToken(token);
  const user = await User.findById(decoded.userId);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive');
  }

  req.user = user;
  next();
});

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }

    next();
  };
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Super Admin access required');
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};
