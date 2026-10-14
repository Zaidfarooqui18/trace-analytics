import { Router } from 'express';
import { getHeatmap } from '../controllers/heatmap.controller.js';

const router = Router();
router.get('/', getHeatmap);

export default router;
