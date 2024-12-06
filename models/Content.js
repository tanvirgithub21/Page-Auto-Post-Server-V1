import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    content_type: String, // Content type like video, image, etc.
    duration: Number, // Duration of the video
    page_id: String, // ID of the associated Facebook page
    page_name: String, // Name of the Facebook page
    description: String, // Content description
    playback_url: String, // URL for playing the content
    public_id: String, // Public ID for the content
    secure_url: String, // Secure URL of the content
    thumbnail_url: String, // URL of the content's thumbnail
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
  }
);

// Create a model for the schema
const Content = mongoose.model("content", contentSchema);

// Export the model for use in other parts of the application
export default Content;
