import Content from "../models/Content.js";

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
