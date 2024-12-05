import Content from "../models/Content.js";
import Page from "../models/Page.js";
import { deleteResourceByPublicId } from "./cloudinary.js";
import { findContentByPageId } from "./curdContent.js";
import { sendEmail } from "./nodemailer.js";

// Function to start the video upload process
const startVideoUploadPhase = async (facebookPageId, pageAccessToken) => {
  try {
    console.log("Starting video upload phase...");
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${facebookPageId}/video_reels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          upload_phase: "start",
          access_token: pageAccessToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error starting upload: ${response.status}`);
    }

    const data = await response.json();
    console.log("Video upload phase started:", data);
    return data; // Contains video_id and upload_url
  } catch (error) {
    console.error("Error starting upload:", error.message);
    throw error;
  }
};

// Function to upload the video file
const uploadVideoFile = async (uploadUrl, videoFileUrl, pageAccessToken) => {
  try {
    console.log("Uploading video file...");
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `OAuth ${pageAccessToken}`,
        file_url: videoFileUrl,
      },
    });

    if (!response.ok) {
      throw new Error(`Error uploading video: ${response.status}`);
    }

    const data = await response.json();
    console.log("Video uploaded successfully:", data);
    return data;
  } catch (error) {
    console.error("Error uploading video:", error.message);
    throw error;
  }
};

// Function to finish the video upload phase and publish the video
const finishVideoUploadPhase = async (
  facebookPageId,
  pageAccessToken,
  videoId,
  videoDescription
) => {
  try {
    console.log("Finishing video upload phase...");
    const finishUrl = `https://graph.facebook.com/v21.0/${facebookPageId}/video_reels?access_token=${pageAccessToken}&video_id=${videoId}&upload_phase=finish&video_state=PUBLISHED&description=${encodeURIComponent(
      videoDescription
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
    console.error("Error finishing upload:", error.message);
    throw error;
  }
};

// Function to upload a video to Facebook for a specific page
export const uploadVideoToFacebookForPage = async (
  facebookPageId,
  pageAccessToken,
  videoFileUrl,
  videoDescription
) => {
  try {
    const { video_id, upload_url } = await startVideoUploadPhase(
      facebookPageId,
      pageAccessToken
    );
    await uploadVideoFile(upload_url, videoFileUrl, pageAccessToken);
    const result = await finishVideoUploadPhase(
      facebookPageId,
      pageAccessToken,
      video_id,
      videoDescription
    );
    return result;
  } catch (error) {
    console.error("Error in video upload process:", error.message);
    throw error;
  }
};

// Function to fetch all pages from the database
const fetchAllPages = async () => {
  try {
    return await Page.find();
  } catch (error) {
    console.error("Error fetching pages:", error.message);
    throw new Error("Error fetching pages");
  }
};

// Function to handle the case where no pages are found
const handleNoPagesFound = () => {
  console.log("No pages found to upload videos.");
  return {
    success: true,
    message: "No pages found to upload videos.",
    details: [],
  };
};

// Function to process all pages and upload videos to them
const processPagesAndUploadVideos = async (pages) => {
  const results = [];
  for (const page of pages) {
    const result = await processSinglePage(page);
    results.push(result);
  }
  return results;
};

// Function to process a single page and upload video content to it
const processSinglePage = async (page) => {
  console.log(`Processing page: ${page.page_name} (ID: ${page.page_id})`);
  try {
    // Fetch content data for the page
    const contentData = await fetchContentForPage(page.page_id);

    // Upload the content to Facebook
    const uploadResult = await uploadContentToFacebook(page, contentData);

    return {
      page_name: page.page_name,
      page_id: page.page_id,
      success: uploadResult.success,
      public_id: uploadResult.success ? contentData.public_id : false,
      content_id: uploadResult.success ? contentData._id : false,
      message: uploadResult.success
        ? "Upload successful"
        : `Upload failed: ${uploadResult.error}`,
    };
  } catch (error) {
    return {
      page_name: page.page_name,
      page_id: page.page_id,
      success: false,
      message: `Error during upload: ${error.message}`,
    };
  }
};

// Function to fetch content data for a specific page
const fetchContentForPage = async (facebookPageId) => {
  const result = await findContentByPageId(facebookPageId);
  if (result.status !== 200) {
    throw new Error("Error finding content");
  }
  if (!result?.data?._id) {
    throw new Error("No content found for this page");
  }
  return result.data;
};

// Function to upload content to Facebook for a specific page
const uploadContentToFacebook = async (page, contentData) => {
  return await uploadVideoToFacebookForPage(
    page.page_id,
    page.long_lived_page_token,
    contentData.secure_url,
    contentData.description
  );
};

// Function to handle unexpected errors during the process
const handleUnexpectedError = (error) => {
  console.error("Unexpected error during upload process:", error.message);
  return {
    success: false,
    message: "Unexpected error during upload process",
    error: error.message,
  };
};

// Main function to upload videos for all pages
const uploadVideosForAllPages = async () => {
  try {
    console.log("Starting the video upload process for all pages...");

    // Fetch all pages
    const pages = await fetchAllPages();

    // If no pages are found, return appropriate response
    if (!pages.length) {
      return handleNoPagesFound();
    }

    // Process each page and collect the results
    const uploadResults = await processPagesAndUploadVideos(pages);

    console.log("Video upload process for all pages completed.");

    return {
      success: true,
      message: "Video upload process completed.",
      details: uploadResults,
    };
  } catch (error) {
    return handleUnexpectedError(error);
  }
};

// Function to process the video upload and delete resources
const uploadAndDeleteVideoContent = async () => {
  const uploadedFb = await uploadVideosForAllPages();
  if (uploadedFb.success && uploadedFb.details) {
    // Iterate through all uploaded video content and delete resources
    const results = await Promise.all(
      uploadedFb.details.map(async (item) => {
        console.log({ first: item });
        if (item.success && item.public_id) {
          try {
            const deleteResult = await deleteResourceByPublicId(item.public_id);
            if (deleteResult.status === 200) {
              return {
                ...item,
                public_id: true, // Mark public_id as true after successful deletion
                delete_message: deleteResult.message,
              };
            } else {
              return {
                ...item,
                public_id: false, // Mark public_id as false if deletion fails
                delete_message: deleteResult.message || "Deletion failed",
              };
            }
          } catch (err) {
            return {
              ...item,
              public_id: false,
              delete_message: err.message || "Error during deletion",
            };
          }
        }
        return item; // If no success or public_id missing, return as is
      })
    );

    return results;
  }
};

// Function to handle the delete operation in the database
const handleDeleteOperation = async (item) => {
  try {
    const result = await Content.deleteOne({ _id: item.content_id });
    if (result.deletedCount > 0) {
      return {
        ...item,
        content_id: true,
        delete_message: "Content deleted successfully",
      };
    } else {
      return {
        ...item,
        delete_message: "Content deletion failed: Not found in database",
      };
    }
  } catch (error) {
    return {
      ...item,
      delete_message: `Content deletion failed: ${error.message}`,
    };
  }
};

// Function to process the array and handle delete operations
const processArrayForDeleteOperation = async () => {
  try {
    const data = await uploadAndDeleteVideoContent();

    // Iterate over the array and process each item
    const processedArray = await Promise.all(
      data.map(async (item) => {
        if (item.success === true && item.public_id === true) {
          return await handleDeleteOperation(item);
        }
        return item;
      })
    );

    return processedArray;
  } catch (error) {
    console.error("Error during processing array for delete:", error.message);
    throw error;
  }
};

// Main function to upload a video to Facebook for a specific page and send mail
export async function VideoUploadFbAndSendEmail() {
  try {
    const arrayData = await processArrayForDeleteOperation(); // Call the function to get the data

    // Check if arrayData is an array
    if (Array.isArray(arrayData)) {
      sendEmail(arrayData); // Pass the array data to sendEmail
    } else {
      console.log("Data is not an array, skipping email sending.");
    }
  } catch (error) {
    console.error("Error in VideoUploadFbAndSendEmail:", error);
    // Optionally handle further, e.g., notify the user or retry
  }
}
