import { handleError } from "../helpers/errorHandlingHelpers.js";
import {
  createLongLivedToken,
  getPageAccessToken,
  refreshAllUnRefTokens,
} from "../helpers/tokenHelpers.js";
import Page from "../models/Page.js";

// Add a new page with tokens and optional reference page data
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
      page_location,
    } = req.body || {};

    let longLivedUserToken,
      usedAppSecret,
      usedAppId,
      usedShortLivedToken,
      createWithRef;

    // If reference page is specified, use its tokens and app data
    if (reference_status && typeof reference_page_id === "string") {
      const referencePage = await Page.findOne({ page_id: reference_page_id });

      if (!referencePage) {
        return res.status(404).json({ message: "Reference page not found" });
      }

      // Reuse tokens and app credentials from the reference page
      longLivedUserToken = referencePage.long_lived_user_token;
      usedAppSecret = referencePage.app_secret;
      usedAppId = referencePage.app_id;
      usedShortLivedToken = referencePage.short_lived_token;
      createWithRef = reference_page_id;
    } else {
      // Generate Long-Lived User Token using the provided credentials
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
      createWithRef = false;
    }

    // Generate a Page Access Token
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
      reference_page_id: createWithRef,
      page_location,
    });

    await newPage.save();

    res.status(200).json({
      message: "Page and tokens saved successfully.",
      page: newPage,
    });
  } catch (error) {
    // Handle errors and return a meaningful response
    const errorDetails = handleError(error, "Error adding page");
    res.status(500).json(errorDetails);
  }
};

// Refresh all unreferenced tokens for pages
export const refreshTokens = async (req, res) => {
  try {
    await refreshAllUnRefTokens(); // Refresh tokens in helper
    res.status(200).json({ message: "Tokens refreshed successfully." });
  } catch (error) {
    const errorDetails = handleError(error, "Error refreshing tokens");
    res.status(500).json(errorDetails);
  }
};

// Get a list of all pages with basic information
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

// Get details of a single page by its name
export const findOnePageByPageName = async (req, res) => {
  try {
    const { page_name } = req.params; // Extract page name from URL parameters
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

// Delete a page by its ID
export const deletePageByPageId = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL parameters
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
