import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import { scheduleJob } from "node-schedule";
import { VideoUploadFbAndSendEmail } from "./helpers/contentUploadHelpers.js";
import { sendEmail } from "./helpers/nodemailer.js";

const app = express();

// Middleware
app.use(express.json());

// Enable CORS for all origins (not recommended for production)
app.use(cors());

// Or enable CORS for specific origin (development environment)
app.use(
  cors({
    origin: "http://localhost:3000", // React App running on localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowing necessary methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowing necessary headers
  })
);

// Database Connection
connectDB();

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/page", pageRoutes);

// প্রতি ৫ দিনে একবার টোকেন রিফ্রেশ করার জন্য
scheduleJob("0 0 */5 * *", () => {
  console.log("Scheduled token refresh initiated (every 5 days).");
  refreshAllTokens();
});

// Setting up schedules (Bangladesh Time)
const scheduleTimes = [
  "0 16 * * *",
  "0 18 * * *",
  "0 20 * * *",
  "0 21 * * *",
  "0 22 * * *",
];

VideoUploadFbAndSendEmail()

// Iterate over each schedule time and set up a job to call uploadAllPages at the specified time
scheduleTimes.forEach((time) =>
  scheduleJob(time, () => VideoUploadFbAndSendEmail())
);

export default app;
