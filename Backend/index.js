import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoute from "./route/user.route.js";
import productRoute from "./route/product.route.js";
import createAdminAccount from "./controller/Admin.controller.js";
import orderRoutes from "./route/order.route.js";
import otpRoutes from "./route/otp.route.js";
import vaccinationRoutes from "./route/VaccinationBooking.route.js";
import mailRoutes from "./route/mailRoutes.js";
import emailRoutes from "./route/email.route.js";
import paymentRoutes from "./route/payments.js";
import dashboardRoutes from "./route/dashboard.route.js"; // New import
import { subscriberRoutes } from "./route/subscriber.route.js"; // Updated import format
import productNotificationRoutes from "./route/productNotification.route.js"; // Import product notification routes
import uploadRoutes from "./route/upload.route.js"; // Import upload routes

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

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/user", userRoute);
app.use("/products", productRoute);
app.use("/api", orderRoutes);
app.use("/api/otp", otpRoutes);
app.use('/api', vaccinationRoutes);
app.use("/api", mailRoutes);
app.use("/api", emailRoutes);
app.use('/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes); // New route added
app.use('/api/newsletter', subscriberRoutes); // Added subscriber routes
app.use('/api/notifications', productNotificationRoutes); // Added product notification routes
app.use('/api/upload', uploadRoutes); // Added upload routes

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