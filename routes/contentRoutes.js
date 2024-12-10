import express from "express";
import {
  findAllByPageName,
  findOneByPageName,
  deleteOneById,
  checkCloudinaryStorage,
  addContent, // Fixed spelling for consistency
} from "../controllers/contentController.js";
import { uploadFiles } from "../controllers/uploadController.js";

const router = express.Router();

// Route for adding content
router.post("/add", uploadFiles, addContent);

// Route for finding all content by page name
router.get("/find-all/:page_name", findAllByPageName);

// Route for finding a single content by page name
router.get("/find-one/:page_name", findOneByPageName);

// Route for deleting content by ID
router.delete("/delete/:id", deleteOneById);

// Route for checking Cloudinary storage status
router.get("/check-storage", checkCloudinaryStorage);

export default router;
