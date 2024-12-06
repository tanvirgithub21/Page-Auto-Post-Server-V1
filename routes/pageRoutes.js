import express from "express";
import {
  addPage,
  findAllPage,
  deletePageByPageId,
  findOnePageByPageName,
} from "../controllers/pageController.js";
import { refreshAllTokens } from "../helpers/tokenHelpers.js";

const router = express.Router();

// Route for adding a new page
router.post("/add", addPage);

// Route for refreshing all tokens
router.post("/refresh-tokens", refreshAllTokens);

// Route for retrieving all pages
router.get("/all", findAllPage);

// Route for retrieving a single page by name
router.get("/find-one/:page_name", findOnePageByPageName);

// Route for deleting a page by ID
router.delete("/delete/:id", deletePageByPageId);

export default router;
