import { Router } from 'express';
import { updateVehicleLocation, updateLocationSchema } from '../controllers/emergency';
import { validateRequest } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
const router = Router();
router.use(authenticate);
router.post('/update', requireRoles('EMERGENCY_OPERATOR', 'CONTROL_ROOM', 'ADMIN'), validateRequest(updateLocationSchema), updateVehicleLocation);
export default router;
