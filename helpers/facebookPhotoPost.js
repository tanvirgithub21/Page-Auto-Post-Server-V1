import Content from "../models/Content.js";
import Page from "../models/Page.js";
import { deleteResourceByPublicId } from "./cloudinary.js";
import axios from "axios";

function uploadPhotoFromUrl(pageId, accessToken, photoUrl, caption) {
  return new Promise(async (resolve) => {
    try {
      const url = `https://graph.facebook.com/v17.0/${pageId}/photos`;
      const params = {
        url: photoUrl,
        caption: caption,
        access_token: accessToken,
      };

      const response = await axios.post(url, params);
      console.log("Photo uploaded successfully:", response.data);
      resolve({ status: true, data: response.data });
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      console.error("Error uploading photo:", errorMessage);
      resolve({ status: false, error: errorMessage });
    }
  });
}

export async function uploadPhotoForAllPages() {
  try {
    const allPages = await Page.find();

    if (!allPages || allPages.length === 0) {
      console.warn("No pages found to process.");
      return [];
    }

    const uploadPromises = allPages.map(async (page) => {
      try {
        const content = await Content.findOne({
          page_id: page.page_id,
          content_type: "Photo",
        });

        if (!content) {
          console.warn(`No photo content found for page ID: ${page.page_id}`);
          return null;
        }

        const { page_id, long_lived_page_token, _id } = page;
        const { secure_url, public_id, description } = content;

        const uploadResult = await uploadPhotoFromUrl(
          page_id,
          long_lived_page_token,
          secure_url,
          description
        );

        if (uploadResult.status) {
          const deleteDatabaseData = await Content.deleteOne({ _id });
          if (deleteDatabaseData) {
            const deleteResult = await deleteResourceByPublicId(public_id);
            return {
              success: true,
              public_id_deleted: deleteResult.status === 200,
              delete_message: deleteResult.message,
            };
          }
        } else {
          console.error(`Failed to upload photo for page ID: ${page.page_id}`);
        }
      } catch (error) {
        console.error(`Error processing page ID: ${page.page_id}`, error);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    console.log("Processing results:", results.filter(Boolean));
    return results.filter(Boolean);
  } catch (error) {
    console.error("Error processing all pages:", error);
    return [];
  }
}
