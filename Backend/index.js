import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./route/user.route.js";
import productRoute from "./route/product.route.js";
import createAdminAccount from "./controller/Admin.controller.js";
import orderRoutes from "./route/order.route.js";
import otpRoutes from "./route/otp.route.js";
import vaccinationRoutes from "./route/VaccinationBooking.route.js"; // Corrected path

// Load environment variables
dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());

// Server port & MongoDB URI
const PORT = process.env.PORT || 4001;
const URI = process.env.MongoDBURI;

// MongoDB Connection
mongoose
  .connect(URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    createAdminAccount(); // Ensure admin account is created after DB connection
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

// Handle MongoDB connection errors
mongoose.connection.on("error", (err) => {
  console.error("⚠️ MongoDB Error:", err);
});

// Routes
app.use("/user", userRoute);
app.use("/products", productRoute);
app.use("/api", orderRoutes);
app.use("/api/otp", otpRoutes);
app.use('/api', vaccinationRoutes); // Changed to '/api' to match routes defined in VaccinationBooking.routes.js

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("⚠️ Error:", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message || "Something went wrong!"
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});