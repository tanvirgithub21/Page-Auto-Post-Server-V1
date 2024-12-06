import Content from "../models/Content.js";

// Function to find content by page ID
export const findContentByPageId = async (pageId) => {
  try {
    // Search for content based on page ID
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
    console.error("Error fetching content by page ID:", err.message || err);
    return {
      status: 500,
      message: "Error fetching content data.",
      error: err.message || err,
    };
  }
};

// Function to delete content by content ID
export const deleteContentByContentId = async (contentId) => {
  try {
    // Attempt to delete the content by its unique _id
    const deletedContent = await Content.findByIdAndDelete(contentId);

    if (!deletedContent) {
      return {
        status: 404,
        message: "Content not found for this content ID.",
      };
    }

    return {
      status: 200,
      message: "Content deleted successfully.",
      data: deletedContent, // Optional: include the deleted content details
    };
  } catch (err) {
    console.error("Error deleting content by content ID:", err.message || err);
    return {
      status: 500,
      message: "Error deleting content.",
      error: err.message || err,
    };
  }
};
