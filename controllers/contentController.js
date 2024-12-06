import Content from "../models/Content.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add new content to the database
export const addContent = async (req, res) => {
  const contentData = req.body; // Content data received from the client

  const newContent = new Content(contentData);

  // Save content to the database
  newContent
    .save()
    .then((data) =>
      res.status(200).json({
        data,
        message: "Content data saved successfully!",
      })
    )
    .catch((err) =>
      res.status(500).json({
        message: "Error saving content data",
        error: err,
      })
    );
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
