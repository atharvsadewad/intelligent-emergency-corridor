import { Router } from 'express';
import { getOfficers, getOfficerById } from '../controllers/officer';
import { authenticate, requireRoles } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', requireRoles('CONTROL_ROOM', 'ADMIN', 'TRAFFIC_OFFICER'), getOfficers);
router.get('/:id', requireRoles('CONTROL_ROOM', 'ADMIN', 'TRAFFIC_OFFICER'), getOfficerById);
export default router;
