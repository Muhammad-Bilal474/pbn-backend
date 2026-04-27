import User from "../models/User.js";
import Post from "../models/Post.js";
import { ApiError, asyncHandler, ApiResponse } from "../utils/helpers.js";
import jwtUtil from "../utils/jwt.js";

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

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        user,
        "User created successfully",
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

  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

