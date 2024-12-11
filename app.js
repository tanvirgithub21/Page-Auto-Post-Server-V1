import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import contentRoutes from "./routes/contentRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import { scheduleJob } from "node-schedule";
import { VideoUploadFbAndSendEmail } from "./helpers/contentUploadHelpers.js";
import { refreshAllTokens } from "./helpers/tokenHelpers.js";
import path from "path";
import { fileURLToPath } from "url";
import { uploadPhotoForAllPages } from "./helpers/facebookPhotoPost.js";

// Initialize express app
const app = express();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Enable CORS for specific origin (for development environment)
const allowedOrigin = process.env.CLIENT_URL
  ? process.env.CLIENT_URL
  : "https://reels-vipe-net.netlify.app";
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

// Schedule content upload and email sending at the specified times
scheduleTimes.forEach((time) =>
  scheduleJob(time, () => {
    console.log(`Scheduled video upload and email sending at ${time}.`);
    VideoUploadFbAndSendEmail();
  })
);
// Setting up schedules for content upload (Bangladesh Time)
const scheduleTimesForPhoto = [
  "0 13 * * *", // দুপুর ১:০০ (লন্ডন সকাল ৭টা)
  "0 18 * * *", // সন্ধ্যা ৬:০০ (লন্ডন দুপুর ১২টা)
  "0 21 * * *", // রাত ৯:০০ (লন্ডন বিকাল ৩টা)
  "0 0 * * *", // রাত ১২:০০ (লন্ডন সন্ধ্যা ৬টা)
  "0 3 * * *", // ভোর ৩:০০ (লন্ডন রাত ৯টা)
];

// Schedule content upload and email sending at the specified times
scheduleTimesForPhoto.forEach((time) =>
  scheduleJob(time, () => {
    console.log(`Scheduled video upload and email sending at ${time}.`);
    uploadPhotoForAllPages();
  })
);

// VideoUploadFbAndSendEmail();


export default app;
