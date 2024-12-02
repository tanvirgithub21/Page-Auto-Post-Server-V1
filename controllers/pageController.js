import { handleError } from "../helpers/errorHandlingHelpers.js";
import {
  createLongLivedToken,
  getPageAccessToken,
  refreshAllTokens,
} from "../helpers/tokenHelpers.js";
import Page from "../models/Page.js";

// Add a new page
export const addPage = async (req, res) => {
  try {
    const { page_name, page_id, short_lived_token, app_id, app_secret } =
      req.body;

    // Create Long-Lived User Token
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

    // Create Page Access Token
    const longLivedPageToken = await getPageAccessToken(
      longLivedUserTokenData.accessToken,
      page_id
    );

    // Save the page details in the database
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
    const errorDetails = handleError(error, "Error adding page");
    res.status(500).json(errorDetails);
  }
};

// Refresh all tokens
export const refreshTokens = async (req, res) => {
  try {
    await refreshAllTokens();
    res.status(200).json({ message: "Tokens refreshed successfully." });
  } catch (error) {
    const errorDetails = handleError(error, "Error refreshing tokens");
    res.status(500).json(errorDetails);
  }
};

// Get all pages
export const findAllPage = async (req, res) => {
  try {
    const pages = await Page.find();
    if (pages.length === 0) {
      return res.status(404).json({ message: "No pages found" });
    }
    res.status(200).json(pages);
  } catch (error) {
    const errorDetails = handleError(error, "Error retrieving pages");
    res.status(500).json(errorDetails);
  }
};

// Get a page by page name
export const findOnePageByPageName = async (req, res) => {
  try {
    const { page_name } = req.params;
    const page = await Page.findOne({ page_name });

    if (!page) {
      return res
        .status(404)
        .json({ message: `Page with name ${page_name} not found` });
    }
    res.status(200).json(page);
  } catch (error) {
    const errorDetails = handleError(error, "Error retrieving the page");
    res.status(500).json(errorDetails);
  }
};

// Delete a page by ID
export const deletePageByPageId = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findByIdAndDelete(id);

    if (!page) {
      return res.status(404).json({ message: `Page with ID ${id} not found` });
    }
    res
      .status(200)
      .json({ message: `Page with ID ${id} has been deleted successfully` });
  } catch (error) {
    const errorDetails = handleError(error, "Error deleting the page");
    res.status(500).json(errorDetails);
  }
};
