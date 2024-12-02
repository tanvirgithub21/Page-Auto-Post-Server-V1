import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  page_name: String, // পেজের নাম
  page_id: String, // পেজের ID
  short_lived_token: String, // Short-Lived User Access Token (শুধু প্রথমবার)
  long_lived_user_token: String, // Long-Lived User Access Token
  long_lived_page_token: String, // Long-Lived Page Access Token
  app_id: String, // পেজের অ্যাপ ID
  app_secret: String, // পেজের অ্যাপ Secret
  token_expiry: mongoose.Schema.Types.Mixed, // Long-Lived User Token এর মেয়াদ শেষের সময়
  last_updated: { type: Date, default: Date.now }, // লাস্ট আপডেটের তারিখ
});

const Page = mongoose.model("page", pageSchema);

export default Page;
