import { Router } from 'express';

import getQuestionsPublic from './getQuestionsPublic.js';
import login from './login.js';
import logout from './logout.js';
import postQuestion from './postQuestion.js';

const router = Router();

router.use('/auth', login); // '/login'
router.use('/auth', logout); // '/logout'

router.use('/questions', postQuestion); // '/'
router.use('/questions', getQuestionsPublic); // '/public'

export default router;
