import jwt from 'jsonwebtoken';
import { ApiError } from './helpers.js';

const generateToken = (userId, expiresIn = process.env.JWT_EXPIRY || '7d') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};


const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Token expired or invalid');
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateToken,
  verifyToken,
  decodeToken,
};
