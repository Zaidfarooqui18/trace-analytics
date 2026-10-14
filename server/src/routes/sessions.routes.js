import { Router } from 'express';
import { listSessions, exportSessions, getSessionEvents } from '../controllers/sessions.controller.js';

const router = Router();
router.get('/', listSessions);
router.get('/export', exportSessions);
router.get('/:sessionId/events', getSessionEvents);

export default router;
