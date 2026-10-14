import { Router } from 'express';
import { listPages } from '../controllers/pages.controller.js';

const router = Router();
router.get('/', listPages);

export default router;
