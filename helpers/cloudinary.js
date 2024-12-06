import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define the possible Cloudinary resource types
const resourceTypes = ["image", "video", "raw"];

// Delete a Cloudinary resource using its public ID
export const deleteResourceByPublicId = async function (publicId) {
  for (const resourceType of resourceTypes) {
    try {
      // Attempt to delete the resource for the current type
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      // If the deletion is successful
      if (result.result === "ok") {
        return {
          status: 200,
          message: `Resource deleted successfully as ${resourceType}.`,
          data: result,
        };
      }

      // If the resource is not found, try the next type
      if (result.result === "not found") {
        continue;
      }
    } catch (err) {
      // Handle any errors during the deletion process
      return {
        status: 500,
        message: "Error occurred while deleting the resource.",
        error: err.message || err,
      };
    }
  }

  // If the resource could not be found in any type
  return {
    status: 404,
    message: "Resource not found for any resource type.",
  };
};
