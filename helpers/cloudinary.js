import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Possible resource types
const resourceTypes = ["image", "video", "raw"];

// Function to delete a resource by public_id
export const deleteResourceByPublicId = async (publicId) => {
  for (const resourceType of resourceTypes) {
    try {
      // Attempt to delete the resource
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

      if (result.result === "ok") {
        return {
          status: 200,
          message: `Resource deleted successfully as ${resourceType}.`,
          data: result,
        };
      }

      if (result.result === "not found") {
        continue; // Try the next resource type
      }
    } catch (err) {
      return {
        status: 500,
        message: "Error deleting resource.",
        error: err.message || err,
      };
    }
  }

  return {
    status: 404,
    message: "Resource not found in any resource type.",
  };
};
