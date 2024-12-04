import Content from "../models/Content.js";
import Page from "../models/Page.js";
import { deleteResourceByPublicId } from "./cloudinary.js";
import { findContentByPageId } from "./curdContent.js";

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

/**
 * 1. Fetch all pages from the database.
 *    This function retrieves all available pages stored in the `Page` collection.
 */
const getAllPages = async () => {
  try {
    return await Page.find();
  } catch (error) {
    console.error("Error fetching pages:", error.message);
    throw new Error("Error fetching pages");
  }
};

/**
 * 2. Handle the case where no pages are found.
 *    This function returns an appropriate response if the `Page` collection is empty.
 */
const noPagesFoundResponse = () => {
  console.log("No pages found to upload videos.");
  return {
    success: true,
    message: "No pages found to upload videos.",
    details: [],
  };
};

/**
 * 3. Process all pages sequentially.
 *    This function iterates through the list of pages and calls `processPage` for each page.
 */
const processPages = async (pages) => {
  const results = [];
  for (const page of pages) {
    const result = await processPage(page);
    results.push(result);
  }
  return results;
};

/**
 * 4. Process a single page.
 *    This function handles fetching content for a page and uploading it to Facebook.
 */
const processPage = async (page) => {
  console.log(`Processing page: ${page.page_name} (ID: ${page.page_id})`);
  try {
    // Fetch content data for the page
    const contentData = await getContentForPage(page.page_id);

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

/**
 * 5. Fetch content for a specific page.
 *    This function fetches video content associated with the given page ID.
 */
const getContentForPage = async (pageId) => {
  const result = await findContentByPageId(pageId);
  if (result.status !== 200) {
    throw new Error("Content find Error");
  }
  if (!result?.data?._id) {
    throw new Error("Content not found for this page");
  }
  return result.data;
};

/**
 * 6. Upload content to Facebook.
 *    This function uploads the provided video content to Facebook using the page's credentials.
 */
const uploadContentToFacebook = async (page, contentData) => {
  return await uploadVideoToFacebookContent(
    page.page_id,
    page.long_lived_page_token,
    contentData.secure_url,
    contentData.description
  );
};

/**
 * 7. Handle unexpected errors during the process.
 *    This function logs and returns details about any unexpected errors encountered.
 */
const handleUnexpectedError = (error) => {
  console.error("Unexpected error in upload process:", error.message);
  return {
    success: false,
    message: "Unexpected error in upload process",
    error: error.message,
  };
};

// Main function to handle the complete video upload process for all pages
const uploadVideoToFacebookContentAllPages = async () => {
  try {
    console.log("Starting the upload process for all pages...");

    // Fetch all pages
    const pages = await getAllPages();

    // If no pages are found, handle it and return
    if (!pages.length) {
      return noPagesFoundResponse();
    }

    // Process each page and collect results
    const uploadResults = await processPages(pages);

    console.log("Upload process for all pages completed.");

    return {
      success: true,
      message: "Upload process completed.",
      details: uploadResults,
    };
  } catch (error) {
    return handleUnexpectedError(error);
  }
};

const processAndDeleteResources = async () => {
  const uploadedFb = await uploadVideoToFacebookContentAllPages();
  if (uploadedFb.success && uploadedFb.details) {
    // Iterate through all items in the data array
    const results = await Promise.all(
      uploadedFb.details.map(async (item) => {
        console.log({ first: item });
        // If success is true, attempt to delete the resource
        if (item.success && item.public_id) {
          try {
            const deleteResult = await deleteResourceByPublicId(item.public_id);

            // If the resource was deleted, update public_id to true
            if (deleteResult.status === 200) {
              return {
                ...item,
                public_id: true, // Mark public_id as true after successful deletion
                delete_message: deleteResult.message,
              };
            } else {
              // If deletion failed, mark public_id as false and add delete_message
              return {
                ...item,
                public_id: false, // Mark public_id as false if deletion fails
                delete_message: deleteResult.message || "Deletion failed",
              };
            }
          } catch (err) {
            // If an error occurs, mark public_id as false and add error message
            return {
              ...item,
              public_id: false,
              delete_message: err.message || "Error during deletion",
            };
          }
        }

        // If success is false or public_id is missing, return the object as is
        return item;
      })
    );

    return results; // Return the updated array of objects
  }
};

// Utility function for handling delete operations
const handleDeleteOperation = async (item) => {
  try {
    // Attempt to delete the content
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

export const processArrayForDeleteOperation = async () => {
  try {
    const data = await processAndDeleteResources();

    // Iterate over the array and process each object
    const processedArray = await Promise.all(
      data.map(async (item) => {
        if (item.success === true && item.public_id === true) {
          return await handleDeleteOperation(item);
        }
        return item; // If conditions are not met, return the item as is
      })
    );

    return processedArray; // Return the final processed array
  } catch (error) {
    console.error(`Error processing array: ${error.message}`);
    throw error; // Re-throw error to be handled by the caller
  }
};
