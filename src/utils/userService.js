import bcrypt from 'bcrypt';
import User from '../models/User.js';

/**
 * Create a super admin user
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} name - Admin name
 * @returns {Promise<Object>} Created admin user
 */
export const createSuperAdmin = async (email, password, name = 'Super Admin') => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      throw new Error(`Admin with email ${email} already exists`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create super admin
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      assignedSheets: [],
    });

    await admin.save();

    return {
      success: true,
      message: 'Super Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

/**
 * Create a regular user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (email, password, name) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'USER',
      isActive: true,
      assignedSheets: [],
    });

    await user.save();

    return {
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

/**
 * Delete user by email
 * @param {string} email - User email to delete
 * @returns {Promise<Object>} Result
 */
export const deleteUserByEmail = async (email) => {
  try {
    const result = await User.findOneAndDelete({ email });

    if (!result) {
      throw new Error(`User with email ${email} not found`);
    }

    return {
      success: true,
      message: `User ${email} deleted successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

/**
 * Get all users
 * @returns {Promise<Array>} List of users
 */
export const getAllUsers = async () => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return {
      success: true,
      users,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User data
 */
export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email }, '-password');

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

/**
 * Update user role
 * @param {string} email - User email
 * @param {string} role - New role (SUPER_ADMIN or USER)
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRole = async (email, role) => {
  try {
    if (!['SUPER_ADMIN', 'USER'].includes(role)) {
      throw new Error('Invalid role. Must be SUPER_ADMIN or USER');
    }

    const user = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    return {
      success: true,
      message: `User role updated to ${role}`,
      user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

export default {
  createSuperAdmin,
  createUser,
  deleteUserByEmail,
  getAllUsers,
  getUserByEmail,
  updateUserRole,
};
