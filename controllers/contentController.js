import Content from "../models/Content.js";

// Add Content
export const addContent = async (req, res) => {
  const contentData = req.body;

  const newContent = new Content(contentData);
  newContent
    .save()
    .then((data) =>
      res
        .status(200)
        .json({ data, message: "Content data saved successfully!" })
    )
    .catch((err) =>
      res.status(500).json({ message: "Error saving content data", error: err })
    );
};

// Find All by Page Name
export const findAllByPageName = async (req, res) => {
  const { page_name } = req.params;

  try {
    const contents = await Content.find({ page_name });
    if (contents.length === 0) {
      return res
        .status(404)
        .json({ message: "No content found for this page name." });
    }
    res.status(200).json({ data: contents });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching content data", error: err });
  }
};

// Find One by Page Name
export const findOneByPageName = async (req, res) => {
  const { page_name } = req.params;

  try {
    const content = await Content.findOne({ page_name });
    if (!content) {
      return res
        .status(404)
        .json({ message: "Content not found for this page name." });
    }
    res.status(200).json({ data: content });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching content data", error: err });
  }
};

// Delete One by ID
export const deleteOneById = async (req, res) => {
  const { id } = req.params;

  try {
    const content = await Content.findByIdAndDelete(id);
    if (!content) {
      return res
        .status(404)
        .json({ message: "Content not found with this ID." });
    }
    res
      .status(200)
      .json({ message: "Content deleted successfully!", data: content });
  } catch (err) {
    res.status(500).json({ message: "Error deleting content", error: err });
  }
};
