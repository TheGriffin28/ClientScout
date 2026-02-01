import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  verifyUserEmail,
  toggleTwoFactor,
  verifyTwoFactor,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyUserEmail);
router.post("/login", loginUser);
router.post("/verify-2fa", verifyTwoFactor);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/update-password", protect, updatePassword);
router.patch("/toggle-2fa", protect, toggleTwoFactor);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
