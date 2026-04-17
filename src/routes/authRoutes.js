import express from "express";
import {
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  assignSheets,
} from "../controllers/authController.js";
import { authenticate, authorize, isSuperAdmin } from "../middleware/auth.js";
import {
  validateLoginRequest,
  validateUserCreation,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/login", validateLoginRequest, handleValidationErrors, login);

// Protected routes (all users)
router.get("/me", authenticate, getCurrentUser);
router.put("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);

// Super Admin routes
router.get("/users", authenticate, isSuperAdmin, getAllUsers);
router.post(
  "/users",
  authenticate,
  isSuperAdmin,
  validateUserCreation,
  handleValidationErrors,
  createUser,
);
router.put("/users/:userId", authenticate, isSuperAdmin, updateUser);
router.delete("/users/:userId", authenticate, isSuperAdmin, deleteUser);
router.post(
  "/users/:userId/assign-sheets",
  authenticate,
  isSuperAdmin,
  assignSheets,
);

export default router;
