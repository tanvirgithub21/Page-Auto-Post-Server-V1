import express from "express";
import {
  addContent,
  findAllByPageName,
  findOneByPageName,
  deleteOneById,
  chackCloudinaryStorage,
} from "../controllers/contentController.js";

const router = express.Router();

router.post("/add", addContent);
router.get("/find-all/:page_name", findAllByPageName);
router.get("/find-one/:page_name", findOneByPageName);
router.delete("/delete/:id", deleteOneById);
router.get("/check-storage", chackCloudinaryStorage);

export default router;
