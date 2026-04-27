import bcrypt from 'bcrypt';
import User from '../models/User.js';

/**
 * Simplified User Service
 */

// Hash password helper
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const createUser = async (email, password, name, role = 'USER') => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error(`User ${email} already exists`);

    const hashedPassword = await hashPassword(password);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true
    });

    return {
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getAllUsers = async () => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return { success: true, users };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteUser = async (id) => {
  try {
    await User.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default {
  createUser,
  getAllUsers,
  deleteUser
};
