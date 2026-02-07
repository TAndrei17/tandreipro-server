import { Router } from 'express';

import login from './login.js';
import logout from './logout.js';

const router = Router();

router.use('/auth', login);
router.use('/auth', logout);

export default router;
