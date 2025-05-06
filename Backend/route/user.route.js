import express from "express";
import { 
  signup, 
  login, 
  forgotPassword, 
  resetPassword, 
  findUserByEmail, 
  getAllUsers,
  checkEmail,
  updateUser,
  deleteUser,
  completeGoogleSignup,
  loginWithGoogle
} from "../controller/user.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes - no authentication required
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/check-email", checkEmail);
router.post("/auth/complete-google-signup", completeGoogleSignup);
router.post("/login-with-google", loginWithGoogle);

// Protected routes - authentication required
router.post("/find-user", verifyToken, findUserByEmail);
router.get("/users", verifyToken, getAllUsers);
router.put("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, deleteUser);

export default router;