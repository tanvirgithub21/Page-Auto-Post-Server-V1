import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create uploads folder
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Prefix filename with a timestamp
  },
});

// Initialize Multer
const upload = multer({ storage });

// Middleware to handle multiple file uploads
export const uploadFiles = upload.array("files", 10); // Accept up to 10 files

