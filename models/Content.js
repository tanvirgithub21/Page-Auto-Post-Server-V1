import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    content_type: String,
    duration: Number,
    page_id: String,
    page_name: String,
    description: String,
    playback_url: String,
    public_id: String,
    secure_url: String,
    thumbnail_url: String,
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model("content", contentSchema);

export default Content;
