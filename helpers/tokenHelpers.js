import axios from "axios";
import Page from "../models/Page.js";

// Function: Short-Lived Token থেকে Long-Lived User Token তৈরি করা
export const createLongLivedToken = async (
  shortLivedToken,
  appId,
  appSecret
) => {
  try {
    const url = `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const { data } = await axios.get(url);
    const { access_token, expires_in } = data;
    const expiryDate = new Date(Date.now() + expires_in * 1000);
    return { accessToken: access_token, expiryDate };
  } catch (error) {
    console.error("Error creating Long-Lived Token:", error.message);
    return null;
  }
};

// Function: Long-Lived User Token দিয়ে Page Access Token বের করা
export const getPageAccessToken = async (userToken, pageId) => {
  try {
    const url = `https://graph.facebook.com/v17.0/${pageId}?fields=access_token&access_token=${userToken}`;
    const { data } = await axios.get(url);
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Page Access Token:", error.message);
    return null;
  }
};

// Function: Long-Lived Token রিফ্রেশ করা
export const refreshLongLivedToken = async (
  currentLongLivedToken,
  appId,
  appSecret
) => {
  try {
    const url = `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentLongLivedToken}`;
    const { data } = await axios.get(url);
    const { access_token, expires_in } = data;
    const expiryDate = new Date(Date.now() + expires_in * 1000);
    return { accessToken: access_token, expiryDate };
  } catch (error) {
    console.error("Error refreshing Long-Lived Token:", error.message);
    return null;
  }
};

// Function: সমস্ত পেজের টোকেন রিফ্রেশ করা
export const refreshAllUnRefTokens = async () => {
  try {
    const pages = await Page.find();

    for (const page of pages) {
      if (page?.create_with_ref === true) {
        console.log(`Refreshing tokens for page: ${page.page_name}`);

        // Long-Lived User Token রিফ্রেশ করা
        const refreshedUserToken = await refreshLongLivedToken(
          page.long_lived_user_token,
          page.app_id,
          page.app_secret
        );

        if (refreshedUserToken) {
          page.long_lived_user_token = refreshedUserToken.accessToken;
          page.token_expiry = refreshedUserToken.expiryDate;
        } else {
          console.error(
            `Failed to refresh Long-Lived User Token for page: ${page.page_name}`
          );
          continue;
        }

        // Page Access Token রিফ্রেশ করা
        const longLivedPageToken = await getPageAccessToken(
          page.long_lived_user_token,
          page.page_id
        );

        if (longLivedPageToken) {
          page.long_lived_page_token = longLivedPageToken;
          page.last_updated = Date.now();
          await page.save();
          console.log(
            `Tokens updated successfully for page: ${page.page_name}`
          );
        } else {
          console.error(
            `Failed to refresh Page Access Token for page: ${page.page_name}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error refreshing all tokens:", error.message);
  }
};

// Helper function to fetch all pages
const findAllPages = async () => {
  try {
    const pages = await Page.find();
    if (pages.length === 0) {
      return res.status(404).json({ message: "No pages found" });
    }
    return pages;
  } catch (error) {
    const errorDetails = handleError(error, "Error retrieving pages");
    console.error(errorDetails);
    throw error; // Ensure the calling function can handle the error
  }
};

// Function to refresh reference page tokens
export const refreshRefPageTokens = async () => {
  try {
    // Retrieve all pages
    const pages = await findAllPages();

    // Process each page
    for (const page of pages) {
      // Check if the page has a reference_page_id
      if (page.reference_page_id) {
        const referencePageId = page.reference_page_id;

        // Find the reference page from the list
        const referenceData = pages.find((d) => d.page_id === referencePageId);

        if (referenceData) {
          // Fetch a new token using the reference page's long-lived user token
          const newToken = await getPageAccessToken(
            referenceData.long_lived_user_token,
            page.page_id
          );

          // Update the current page's data
          page.long_lived_user_token = referenceData.long_lived_user_token;
          page.long_lived_page_token = newToken;
          page.last_updated = Date.now();

          // Save the updated page to the database
          await page.save();
        }
      }
    }

    return pages;
  } catch (error) {
    console.error("Error refreshing reference page tokens:", error);
    throw error; // Ensure the error is propagated
  }
};

export const refreshAllTokens = async () => {
  try {
    // Refresh tokens for pages without reference_page_id
    await refreshAllUnRefTokens();

    // Refresh tokens for pages with reference_page_id
    await refreshRefPageTokens();

    console.log("All tokens refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing tokens:", error.message);
  }
};
