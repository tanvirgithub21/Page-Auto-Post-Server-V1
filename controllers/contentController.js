import Content from "../models/Content.js";
import { v2 as cloudinary } from "cloudinary";
import mime from "mime";
import fs from "fs-extra";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add new content to the database
export const addContent = async (req, res) => {
  try {
    // Process each file asynchronously
    const uploadPromises = req.files.map(async (file) => {
      // Check file existence
      if (!(await fs.pathExists(file.path))) {
        throw new Error(`File path ${file.path} does not exist`);
      }

      // Validate MIME type (allow images and videos)
      const mimeType = mime.getType(file.path);
      if (!mimeType.startsWith("image") && !mimeType.startsWith("video")) {
        throw new Error(
          `Unsupported file format: ${mimeType}. Only images and videos are allowed.`
        );
      }

      // Determine Cloudinary folder based on file type
      const uploadFolder = mimeType.startsWith("image")
        ? `images${req?.body?.page_id || ""}`
        : `videos${req?.body?.page_id || ""}`;

      console.log(`Uploading file: ${file.path}, MIME type: ${mimeType}`);

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
        folder: uploadFolder,
      });

      console.log("Upload result:", result);

      // Delete the local file
      await fs.unlink(file.path);

      // Prepare content data
      const contentData = {
        secure_url: result.secure_url,
        type: mimeType,
        original_name: file.originalname,
        public_id: result.public_id,
        content_type: req?.body?.content_type || "default",
        duration: result.duration,
        page_id: req?.body?.page_id || "unknown",
        server_id: "auto",
        description: req?.body?.description || "",
        playback_url: result.playback_url || null,
      };

      // Save content to the database
      const newContent = new Content(contentData);
      return await newContent.save();
    });

    // Wait for all files to be uploaded and saved
    const uploadedFiles = await Promise.all(uploadPromises);

    console.log("Uploaded Files:", uploadedFiles);

    // Send response with uploaded file details
    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(400).json({
      message: error.message || "Error uploading files",
      error,
    });
  }
};

// Fetch all content by page name
export const findAllByPageName = async (req, res) => {
  const { page_name } = req.params; // Extract page name from URL parameters

  try {
    const contents = await Content.find({ page_name }); // Find all matching content
    if (contents.length === 0) {
      return res.status(404).json({
        message: "No content found for this page name.",
      });
    }
    res.status(200).json({ data: contents });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching content data",
      error: err,
    });
  }
};

// Fetch a single content item by page name
export const findOneByPageName = async (req, res) => {
  const { page_name } = req.params; // Extract page name from URL parameters

  try {
    const content = await Content.findOne({ page_name }); // Find one matching content
    if (!content) {
      return res.status(404).json({
        message: "Content not found for this page name.",
      });
    }
    res.status(200).json({ data: content });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching content data",
      error: err,
    });
  }
};

// Delete a specific content item by its ID
export const deleteOneById = async (req, res) => {
  const { id } = req.params; // Extract ID from URL parameters

  try {
    const content = await Content.findByIdAndDelete(id); // Delete the content by ID
    if (!content) {
      return res.status(404).json({
        message: "Content not found with this ID.",
      });
    }
    res.status(200).json({
      message: "Content deleted successfully!",
      data: content,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting content",
      error: err,
    });
  }
};

// Check Cloudinary storage usage
export const checkCloudinaryStorage = async (req, res) => {
  try {
    // Fetch usage data from Cloudinary
    const usage = await cloudinary.api.usage();
    const usedStorageBytes = usage.storage.usage; // Storage used in bytes
    const totalStorageGB = 25; // Free plan's total storage in GB

    // Convert bytes to GB
    const usedStorageGB = usedStorageBytes / 1073741824; // 1 GB = 1073741824 bytes
    const remainingStorageGB = totalStorageGB - usedStorageGB; // Remaining storage

    // Log storage information for debugging
    console.log("Total Storage: 25 GB (Free Plan)");
    console.log("Used Storage:", usedStorageGB.toFixed(2), "GB");
    console.log("Remaining Storage:", remainingStorageGB.toFixed(2), "GB");

    res.json({
      used_storage: usedStorageGB.toFixed(2), // Used storage in GB
      total_storage: remainingStorageGB.toFixed(2), // Remaining storage in GB
    });
  } catch (err) {
    console.error("Error fetching Cloudinary storage info:", err);
    res.status(500).json({ message: "Error fetching storage info" });
  }
};
