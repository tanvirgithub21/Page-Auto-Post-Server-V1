import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  page_name: String, // Name of the page
  page_id: String, // ID of the page
  reference_page_id: mongoose.Schema.Types.Mixed, // Accepts both Boolean and String values
  reference_status: Boolean, // Reference status
  short_lived_token: String, // Short-Lived User Access Token (used only the first time)
  long_lived_user_token: String, // Long-Lived User Access Token
  long_lived_page_token: String, // Long-Lived Page Access Token
  app_id: String, // App ID of the page
  app_secret: String, // App Secret of the page
  page_location: Number, // Default to London
  token_expiry: mongoose.Schema.Types.Mixed, // Expiry time of the Long-Lived User Token
  last_updated: { type: Date, default: Date.now }, // Date of the last update
});

const Page = mongoose.model("page", pageSchema);

export default Page;
