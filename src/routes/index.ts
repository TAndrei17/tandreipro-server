import { Router } from 'express';

import adminPanel from './adminPanel.js';
import login from './login.js';
import logout from './logout.js';
import publicQuestions from './publicQuestions.js';

const router = Router();

router.use('/auth', login); // '/login'
router.use('/auth', logout); // '/logout'

router.use('/public', publicQuestions); // '/'

router.use('/admin', adminPanel); // '/'

export default router;
