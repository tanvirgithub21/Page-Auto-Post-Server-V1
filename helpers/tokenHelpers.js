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
export const refreshAllTokens = async () => {
  try {
    const pages = await Page.find();

    for (const page of pages) {
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
        console.log(`Tokens updated successfully for page: ${page.page_name}`);
      } else {
        console.error(
          `Failed to refresh Page Access Token for page: ${page.page_name}`
        );
      }
    }
  } catch (error) {
    console.error("Error refreshing all tokens:", error.message);
  }
};
