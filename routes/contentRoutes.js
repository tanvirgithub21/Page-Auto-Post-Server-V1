import express from 'express';
import { addContent } from '../controllers/contentController.js';

const router = express.Router();

router.post('/add', addContent);

export default router;
