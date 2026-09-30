import { Router } from 'express';
import { getVehicles, getVehicleById } from '../controllers/vehicle';
import { authenticate, requireRoles } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.get('/', requireRoles('CONTROL_ROOM', 'EMERGENCY_OPERATOR', 'ADMIN'), getVehicles);
router.get('/:id', requireRoles('CONTROL_ROOM', 'EMERGENCY_OPERATOR', 'ADMIN'), getVehicleById);
export default router;
