import Content from "../models/Content.js";
import Page from "../models/Page.js";
import { deleteResourceByPublicId } from "./cloudinary.js";
import axios from "axios";
import { sendEmail } from "./nodemailer.js";

async function postTextWithLocation(pageId, accessToken, message, placeId) {
  try {
    const url = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const response = await axios.post(url, {
      message,
      place: placeId,
      access_token: accessToken,
    });

    console.log("Text post with location created successfully:", response.data);
    return { success: true, postId: response.data.id };
  } catch (error) {
    console.error("Error creating text post with location:", error);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function addPhotoToPost(pageId, accessToken, photoUrl, postId) {
  try {
    const uploadUrl = `https://graph.facebook.com/v21.0/${pageId}/photos`;
    const uploadResponse = await axios.post(uploadUrl, {
      url: photoUrl,
      published: false,
      access_token: accessToken,
    });

    const photoId = uploadResponse.data.id;
    console.log("Photo uploaded successfully:", uploadResponse.data);

    const attachUrl = `https://graph.facebook.com/v21.0/${postId}`;
    await axios.post(attachUrl, {
      attached_media: JSON.stringify([{ media_fbid: photoId }]),
      access_token: accessToken,
    });

    console.log("Photo attached to the post successfully.");
    return { success: true, photoId };
  } catch (error) {
    console.error("Error attaching photo to post:", error);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function createPostWithPhotoAndLocation(
  pageId,
  accessToken,
  message,
  placeId,
  photoUrl
) {
  const results = { success: false, steps: {} };

  // Step 1: Create a text post with location
  const textPostResult = await postTextWithLocation(
    pageId,
    accessToken,
    message,
    placeId
  );
  results.steps.textPost = textPostResult;

  if (!textPostResult.success) {
    return results;
  }

  // Step 2: Add a photo to the existing post
  const photoResult = await addPhotoToPost(
    pageId,
    accessToken,
    photoUrl,
    textPostResult.postId
  );
  results.steps.addPhoto = photoResult;

  if (photoResult.success) {
    results.success = true;
  }

  return results;
}

export async function uploadPhotoForAllPages() {
  const results = [];

  try {
    const allPages = await Page.find();
    if (!allPages || allPages.length === 0) {
      console.warn("No pages found to process.");
      return results;
    }

    for (const page of allPages) {
      const result = { pageId: page.page_id, steps: {}, success: false };

      try {
        const content = await Content.findOne({
          page_id: page.page_id,
          content_type: "Photo",
        });

        if (!content) {
          console.warn(`No photo content found for page ID: ${page.page_id}`);
          result.steps.contentFetch = {
            success: false,
            message: "No content found",
          };
          results.push(result);
          continue;
        }

        result.steps.contentFetch = { success: true };

        const { secure_url, public_id, description, _id } = content;
        const uploadResult = await createPostWithPhotoAndLocation(
          page.page_id,
          page.long_lived_page_token,
          description,
          page.page_location,
          secure_url
        );

        result.steps.upload = uploadResult;

        if (uploadResult.success) {
          const deleteDatabaseData = await Content.deleteOne({ _id });
          result.steps.deleteDatabase = {
            success: deleteDatabaseData?.acknowledged,
            deleteCount: deleteDatabaseData?.deletedCount,
          };

          if (deleteDatabaseData?.acknowledged) {
            const deleteResult = await deleteResourceByPublicId(public_id);
            result.steps.deleteCloudinary = {
              success: deleteResult.status === 200,
              message: deleteResult.message,
            };
          }

          result.success = true;
        }
      } catch (error) {
        console.error(`Error processing page ID: ${page.page_id}`, error);
        result.steps.error = error.message;
      }

      results.push(result);
    }
  } catch (error) {
    console.error("Error processing all pages:", error);
  }

  console.log("Final Results:", JSON.stringify(results, null, 2));

  const sent = await sendEmail(results, "photo");
  console.log("send mail", sent);
  return results;
}

