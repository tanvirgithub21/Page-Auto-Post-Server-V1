import Page from "../models/Page.js";
import { findContentByPageId } from "./findContent.js";


// Function to start the upload phase
const startUploadPhase = async (pageId, accessToken) => {
  try {
    console.log("Starting upload phase...");
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/video_reels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          upload_phase: "start",
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error starting upload: ${response.status}`);
    }

    const data = await response.json();
    console.log("Upload phase started:", data);
    return data; // Contains video_id and upload_url
  } catch (error) {
    console.error("Error starting upload phase:", error.message);
    throw error;
  }
};

// Function to upload the video file
const uploadVideoFile = async (uploadUrl, videoUrl, accessToken) => {
  try {
    console.log("Uploading video...");
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `OAuth ${accessToken}`,
        file_url: videoUrl,
      },
    });

    if (!response.ok) {
      throw new Error(`Error uploading video: ${response.status}`);
    }

    const data = await response.json();
    console.log("Video uploaded:", data);
    return data;
  } catch (error) {
    console.error("Error uploading video:", error.message);
    throw error;
  }
};

// Function to finish the upload phase and publish the video
const finishUploadPhase = async (pageId, accessToken, videoId, description) => {
  try {
    console.log("Finishing upload phase...");
    const finishUrl = `https://graph.facebook.com/v21.0/${pageId}/video_reels?access_token=${accessToken}&video_id=${videoId}&upload_phase=finish&video_state=PUBLISHED&description=${encodeURIComponent(
      description
    )}`;
    const response = await fetch(finishUrl, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Error finishing upload: ${response.status}`);
    }

    const data = await response.json();
    console.log("Video published:", data);
    return data;
  } catch (error) {
    console.error("Error finishing upload phase:", error.message);
    throw error;
  }
};

// Main function to handle the complete upload process
export const uploadVideoToFacebookContent = async (
  pageId,
  accessToken,
  videoUrl,
  description
) => {
  try {
    const { video_id, upload_url } = await startUploadPhase(
      pageId,
      accessToken
    );
    await uploadVideoFile(upload_url, videoUrl, accessToken);
    const result = await finishUploadPhase(
      pageId,
      accessToken,
      video_id,
      description
    );
    return result;
  } catch (error) {
    console.error("Error in video upload process:", error.message);
    throw error;
  }
};

// Function to handle the complete upload process for all pages
export const uploadVideoToFacebookContentAllPages = async () => {
  try {
    console.log("Starting the upload process for all pages...");

    // Fetch all pages directly using Page.find()
    const pages = await Page.find();

    // If no pages are found, log the message and return
    if (pages.length === 0) {
      console.log("No pages found to upload videos.");
      return {
        success: true,
        message: "No pages found to upload videos.",
        details: [],
      };
    }

    // Array to track results for each page
    const uploadResults = [];

    // Iterate over each page and upload videos
    for (const page of pages) {
      console.log(
        `Uploading video for page: ${page.page_name} (ID: ${page.page_id})`
      );
      try {
        // Find one content by page id
        const result = await findContentByPageId(page.page_id);

        if (result.status !== 200) {
          uploadResults.push({
            page_name: page.page_name,
            page_id: page.page_id,
            success: false,
            message: "Content fine Error",
          });
          return;
        } else if (!result?.data?._id) {
          uploadResults.push({
            page_name: page.page_name,
            page_id: page.page_id,
            success: false,
            message: "Content not found this page",
          });
          return;
        }
        const contentData = result.data || {};

        const uploadResult = await uploadVideoToFacebookContent(
          page.page_id,
          page.long_lived_page_token,
          contentData.secure_url,
          contentData.description
        );
        uploadResults.push({
          page_name: page.page_name,
          page_id: page.page_id,
          success: uploadResult.success,
          message: uploadResult.success
            ? "Upload successful"
            : `Upload failed: ${uploadResult.error}`,
        });
      } catch (uploadError) {
        uploadResults.push({
          page_name: page.page_name,
          page_id: page.page_id,
          success: false,
          message: `Error during upload: ${uploadError.message}`,
        });
      }
    }

    console.log("Upload process for all pages completed.");
    console.log(uploadResults)
    return {
      success: true,
      message: "Upload process completed.",
      details: uploadResults,
    };
  } catch (error) {
    console.error("Unexpected error in upload process:", error.message);
    return {
      success: false,
      message: "Unexpected error in upload process",
      error: error.message,
    };
  }
};
