import { Router } from 'express';

// import getQuestionsPublic from './getQuestionsPublic.js';
import login from './login.js';
import logout from './logout.js';
import publicQuestions from './publicQuestions.js';

const router = Router();

router.use('/auth', login); // '/login'
router.use('/auth', logout); // '/logout'

router.use('/public', publicQuestions); // '/'

export default router;
