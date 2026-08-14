import express from 'express';
import { getKBArticles } from '../controllers/kbController.js';

const router = express.Router();

router.get('/', getKBArticles);

export default router;
