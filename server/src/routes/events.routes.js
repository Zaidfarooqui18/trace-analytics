import { Router } from 'express';
import { ingest } from '../controllers/events.controller.js';

const router = Router();
router.post('/', ingest);

export default router;
