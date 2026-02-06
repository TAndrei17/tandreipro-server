import { Router } from 'express';

import login from './login.js';

const router = Router();

router.use('/auth', login);
// router.use('/auth', check);
// router.use('/auth', logout);

export default router;
