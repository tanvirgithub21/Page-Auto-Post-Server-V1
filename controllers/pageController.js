import {
  createLongLivedToken,
  getPageAccessToken,
  refreshAllTokens,
} from "../helpers/tokenHelpers";
import Page from "../models/Page";

export const addPage = async (req, res) => {
  try {
    const { page_name, page_id, short_lived_token, app_id, app_secret } =
      req.body;

    // প্রথমবারের জন্য Short-Lived Token দিয়ে Long-Lived User Token তৈরি
    const longLivedUserTokenData = await createLongLivedToken(
      short_lived_token,
      app_id,
      app_secret
    );

    if (!longLivedUserTokenData) {
      return res
        .status(400)
        .json({ message: "Failed to create Long-Lived User Token" });
    }

    // Long-Lived User Token দিয়ে Page Access Token তৈরি
    const longLivedPageToken = await getPageAccessToken(
      longLivedUserTokenData.accessToken,
      page_id
    );

    // MongoDB-তে নতুন পেজের তথ্য সংরক্ষণ
    const newPage = new Page({
      page_name,
      page_id,
      short_lived_token,
      long_lived_user_token: longLivedUserTokenData.accessToken,
      long_lived_page_token: longLivedPageToken,
      app_id,
      app_secret,
      token_expiry: longLivedUserTokenData.expiryDate,
    });
    await newPage.save();

    res.status(200).json({
      message: "Page and tokens saved successfully.",
      page: newPage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding page", error: error.message });
  }
};

export const refreshTokens = async (req, res) => {
  try {
    await refreshAllTokens();
    res.status(200).json({ message: "Tokens refreshed successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error refreshing tokens", error: error.message });
  }
};

export const findAllPage = async (req, res) => {
  try {
    // Fetch all pages from the database
    const pages = await Page.find();

    // If no pages are found, send a 404 response with a message
    if (pages.length === 0) {
      return res.status(404).json({ message: "No pages found" });
    }

    // If pages are found, send a 200 response with the page data
    res.status(200).json(pages);
  } catch (error) {
    // In case of an error (e.g., database issue), send a 500 response with the error message
    res
      .status(500)
      .json({ message: "Error retrieving pages", error: error.message });
  }
};

export const findOnePageByPageName = async (req, res) => {
  try {
    // Extract the page name from the request parameters
    const { page_name } = req.params;

    // Find a page by its page_name in the database
    const page = await Page.findOne({ page_name });

    // If the page is not found, return a 404 status with a message
    if (!page) {
      return res
        .status(404)
        .json({ message: `Page with name ${page_name} not found` });
    }

    // If the page is found, return it with a 200 status
    res.status(200).json(page);
  } catch (error) {
    // If there's any error (e.g., database issue), return a 500 status with the error message
    res
      .status(500)
      .json({ message: "Error retrieving the page", error: error.message });
  }
};

export const deletePageByPageId = async (req, res) => {
  try {
    // Extract the page ID from the request parameters
    const { id } = req.params;

    // Find the page by its ID and delete it
    const page = await Page.findByIdAndDelete(id);

    // If no page is found with the provided ID, return a 404 status with a message
    if (!page) {
      return res.status(404).json({ message: `Page with ID ${id} not found` });
    }

    // If the page is successfully deleted, return a 200 status with a success message
    res
      .status(200)
      .json({ message: `Page with ID ${id} has been deleted successfully` });
  } catch (error) {
    // If there's any error (e.g., database issue), return a 500 status with the error message
    res
      .status(500)
      .json({ message: "Error deleting the page", error: error.message });
  }
};
