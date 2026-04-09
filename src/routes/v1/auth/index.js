import { Router } from "express";
import {
  forgotPassword,
  login,
  signup,
  resetPassword,
  fetchMe,
} from "../../../controllers/auth/index.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", fetchMe);

export default router;
