import express from "express";
import { 
  signup, 
  login, 
  forgotPassword, 
  resetPassword,
  findUserByEmail,
  getAllUsers,
  checkEmail
} from "../controller/user.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/find-by-email", findUserByEmail);
router.get("/users", getAllUsers);
router.post("/check-email", checkEmail); // Ensure this line exists

export default router;
