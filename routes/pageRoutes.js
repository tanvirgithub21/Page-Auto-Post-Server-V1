import express from "express";
import {
  addPage,
  findAllPage,
  deletePageByPageId,
  findOnePageByPageName,
} from "../controllers/pageController";
import { refreshAllTokens } from "../helpers/tokenHelpers";

const router = express.Router();

router.post("/add", addPage);
router.post("/refresh-tokens", refreshAllTokens);
router.get("/all", findAllPage);
router.get("/find-one/:page_name", findOnePageByPageName);
router.delete("/delete/:id", deletePageByPageId);

export default router;
