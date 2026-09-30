import { Router } from 'express';
import { loginHandler, loginSchema } from '../controllers/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.post('/login', validateRequest(loginSchema), loginHandler);

export default router;
