import Content from "../models/Content.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add Content
export const addContent = async (req, res) => {
  const contentData = req.body;

  const newContent = new Content(contentData);
  newContent
    .save()
    .then((data) =>
      res
        .status(200)
        .json({ data, message: "Content data saved successfully!" })
    )
    .catch((err) =>
      res.status(500).json({ message: "Error saving content data", error: err })
    );
};

// Find All by Page Name
export const findAllByPageName = async (req, res) => {
  const { page_name } = req.params;

  try {
    const contents = await Content.find({ page_name });
    if (contents.length === 0) {
      return res
        .status(404)
        .json({ message: "No content found for this page name." });
    }
    res.status(200).json({ data: contents });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching content data", error: err });
  }
};

// Find One by Page Name
export const findOneByPageName = async (req, res) => {
  const { page_name } = req.params;

  try {
    const content = await Content.findOne({ page_name });
    if (!content) {
      return res
        .status(404)
        .json({ message: "Content not found for this page name." });
    }
    res.status(200).json({ data: content });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching content data", error: err });
  }
};

// Delete One by ID
export const deleteOneById = async (req, res) => {
  const { id } = req.params;

  try {
    const content = await Content.findByIdAndDelete(id);
    if (!content) {
      return res
        .status(404)
        .json({ message: "Content not found with this ID." });
    }
    res
      .status(200)
      .json({ message: "Content deleted successfully!", data: content });
  } catch (err) {
    res.status(500).json({ message: "Error deleting content", error: err });
  }
};

export const chackCloudinaryStorage = async (req, res) => {
  try {
    // স্টোরেজ ব্যবহারের তথ্য নেওয়া হচ্ছে
    const usage = await cloudinary.api.usage();
    // Extract storage usage data from usage
    const usedStorageBytes = usage.storage.usage; // Storage used in bytes
    const totalStorageGB = 25; // Free plan's total storage in GB

    // Convert bytes to GB
    const usedStorageGB = usedStorageBytes / 1073741824; // 1 GB = 1073741824 bytes

    // Calculate remaining storage
    const remainingStorageGB = totalStorageGB - usedStorageGB;

    // Log the storage information
    console.log("Total Storage: 25 GB (Free Plan)");
    console.log("Used Storage:", usedStorageGB.toFixed(2), "GB");
    console.log("Remaining Storage:", remainingStorageGB.toFixed(2), "GB");

    res.json({
      used_storage: usedStorageGB.toFixed(2), // ব্যবহৃত স্টোরেজ (GB)
      total_storage: remainingStorageGB.toFixed(2), // মোট স্টোরেজ (GB) বা 'Not Available'
    });
  } catch (err) {
    console.error("Error fetching Cloudinary storage info:", err);
    res.status(500).json({ message: "Error fetching storage info" });
  }
};
