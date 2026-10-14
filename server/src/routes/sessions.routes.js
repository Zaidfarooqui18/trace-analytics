import { Router } from 'express';
import { listSessions, getSessionEvents } from '../controllers/sessions.controller.js';

const router = Router();
router.get('/', listSessions);
router.get('/:sessionId/events', getSessionEvents);

export default router;
