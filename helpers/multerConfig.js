import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Prefix the filename with a timestamp
  },
});

// Initialize Multer
const upload = multer({ storage });

// Middleware to handle multiple file uploads
export const uploadFiles = upload.array("files", 10); // Accept up to 10 files at once
