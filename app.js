import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/content", contentRoutes);

// Database Connection
connectDB();

export default app;
