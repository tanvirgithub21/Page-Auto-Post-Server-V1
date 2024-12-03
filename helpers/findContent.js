import Content from "../models/Content.js";

// Function to find content by page ID
export const findContentByPageId = async (pageId) => {
  try {
    const content = await Content.findOne({ page_id: pageId });

    if (!content) {
      return {
        status: 404,
        message: "Content not found for this page ID.",
      };
    }

    return {
      status: 200,
      data: content,
    };
  } catch (err) {
    return {
      status: 500,
      message: "Error fetching content data.",
      error: err.message || err,
    };
  }
};
