import { Router } from 'express';

import adminRouter from './admin/adminRouter.js';
import login from './auth/login.js';
import logout from './auth/logout.js';
import publicRouter from './public/publicRouter.js';

const router = Router();

router.use('/auth', login);
router.use('/auth', logout);

router.use('/public', publicRouter);

router.use('/admin', adminRouter);

export default router;
