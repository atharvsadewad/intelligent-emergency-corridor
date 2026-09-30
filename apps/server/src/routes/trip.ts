import { Router } from 'express';
import { getTrips, getTripById } from '../controllers/trip';
import { authenticate, requireRoles } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', requireRoles('CONTROL_ROOM', 'ADMIN', 'EMERGENCY_OPERATOR'), getTrips);
router.get('/:id', requireRoles('CONTROL_ROOM', 'ADMIN', 'EMERGENCY_OPERATOR'), getTripById);
export default router;
