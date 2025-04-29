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

const router = express.Router();

// Existing routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/find-user", findUserByEmail);
router.get("/users", getAllUsers);
router.post("/check-email", checkEmail);

// Google authentication
router.post("/auth/complete-google-signup", completeGoogleSignup);
router.post("/login-with-google", loginWithGoogle);

// New routes for updating and deleting users
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;