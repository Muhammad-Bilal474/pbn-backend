import User from "../models/User.js";
import Post from "../models/Post.js";
import AuditLog from "../models/AuditLog.js";
import { ApiError, asyncHandler, ApiResponse } from "../utils/helpers.js";
import jwtUtil from "../utils/jwt.js";
import { sendWelcomeEmail } from "../utils/emailService.js";
import { ACTIONS } from "../utils/constants.js";

// Register/Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = jwtUtil.generateToken(user._id);

  // Log action
  await AuditLog.create({
    user: user._id,
    action: ACTIONS.LOGIN,
    resource: "AUTH",
    status: "SUCCESS",
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user.toJSON(),
        token,
      },
      "Login successful",
    ),
  );
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("assignedSheets");

  res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { name: name || req.user.name, email: email || req.user.email },
    { new: true, runValidators: true },
  );

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(oldPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get all users (Super Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, status } = req.query;

  const query = {};
  if (role) query.role = role;
  if (status !== undefined) query.isActive = status === "true";

  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .skip(skip)
    .limit(Number(limit))
    .select("-password");

  const total = await User.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "Users fetched successfully",
    ),
  );
});

// Create user (Super Admin only)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, role = "USER" } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const tempPassword = Math.random().toString(36).slice(-8);

  const user = await User.create({
    name,
    email,
    password: tempPassword,
    role,
  });

  // Send welcome email
  // await sendWelcomeEmail(email, name, tempPassword);

  // Log action
  await AuditLog.create({
    user: req.user._id,
    action: ACTIONS.USER_CREATED,
    resource: "USER",
    resourceId: user._id,
    description: `User ${email} created by admin`,
    status: "SUCCESS",
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        user,
        "User created successfully. Credentials sent via email",
      ),
    );
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email, role, isActive },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Log action
  await AuditLog.create({
    user: req.user._id,
    action: ACTIONS.USER_DELETED,
    resource: "USER",
    resourceId: userId,
    description: `User ${user.email} deleted by admin`,
    status: "SUCCESS",
  });

  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

// Assign sheets to user
export const assignSheets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { sheetIds } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    { assignedSheets: sheetIds },
    { new: true },
  ).populate("assignedSheets");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Sheets assigned successfully"));
});
