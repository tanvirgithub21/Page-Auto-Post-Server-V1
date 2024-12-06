import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import contentRoutes from "./routes/contentRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import { scheduleJob } from "node-schedule";
import { VideoUploadFbAndSendEmail } from "./helpers/contentUploadHelpers.js";
import { refreshAllTokens } from "./helpers/tokenHelpers.js";

// Initialize express app
const app = express();

// Middleware for JSON request parsing
app.use(express.json());

// Enable CORS for specific origin (for development environment)
const allowedOrigin = process.env.CLIENT_URL
  ? process.env.CLIENT_URL
  : "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin, // Your App running 
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowing necessary methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowing necessary headers
  })
);

// Connect to database
connectDB();

// Routes
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/page", pageRoutes);

// Schedule job to refresh tokens every 5 days
scheduleJob("0 0 */5 * *", () => {
  console.log("Scheduled token refresh initiated (every 5 days).");
  refreshAllTokens();
});

// Setting up schedules for content upload (Bangladesh Time)
const scheduleTimes = [
  "0 16 * * *", // 4:00 PM (Bangladesh Time)
  "0 18 * * *", // 6:00 PM (Bangladesh Time)
  "0 20 * * *", // 8:00 PM (Bangladesh Time)
  "0 21 * * *", // 9:00 PM (Bangladesh Time)
  "0 22 * * *", // 10:00 PM (Bangladesh Time)
];
VideoUploadFbAndSendEmail();
// Schedule content upload and email sending at the specified times
scheduleTimes.forEach((time) =>
  scheduleJob(time, () => {
    console.log(`Scheduled video upload and email sending at ${time}.`);
    VideoUploadFbAndSendEmail();
  })
);

export default app;
