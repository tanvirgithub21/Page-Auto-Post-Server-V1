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
    const {
      page_name,
      page_id,
      short_lived_token,
      app_id,
      app_secret,
      reference_page_id,
      reference_status,
    } = req.body || {};

    let longLivedUserToken, usedAppSecret, usedAppId, usedShortLivedToken;

    // Check reference_page_id and reference_status
    if (reference_status && typeof reference_page_id === "string") {
      const referencePage = await Page.findOne({ page_id: reference_page_id });

      if (!referencePage) {
        return res.status(404).json({ message: "Reference page not found" });
      }

      // Use data from the reference page
      longLivedUserToken = referencePage.long_lived_user_token;
      usedAppSecret = referencePage.app_secret;
      usedAppId = referencePage.app_id;
      usedShortLivedToken = referencePage.short_lived_token;
    } else {
      // Generate Long-Lived User Token using the provided short-lived token
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

      longLivedUserToken = longLivedUserTokenData.accessToken;
      usedAppSecret = app_secret;
      usedAppId = app_id;
      usedShortLivedToken = short_lived_token;
    }

    // Create Page Access Token
    const longLivedPageToken = await getPageAccessToken(
      longLivedUserToken,
      page_id
    );

    // Save the page details in the database
    const newPage = new Page({
      page_name,
      page_id,
      short_lived_token: usedShortLivedToken,
      long_lived_user_token: longLivedUserToken,
      long_lived_page_token: longLivedPageToken,
      app_id: usedAppId,
      app_secret: usedAppSecret,
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
    const pages = await Page.find().select({
      page_name: 1,
      page_id: 1,
      _id: 1,
    });
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
