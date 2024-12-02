import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import { scheduleJob } from "node-schedule";

const app = express();

// Middleware
app.use(express.json());

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

// Iterate over each schedule time and set up a job to call uploadAllPages at the specified time
scheduleTimes.forEach((time) => scheduleJob(time, () => console.log("ok")));

export default app;
