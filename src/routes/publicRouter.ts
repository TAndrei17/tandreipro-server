import { Router } from 'express';

import createQuestion from '@/services/public/createQuestion.js';
import getApprovedQuestions from '@/services/public/getApprovedQuestions.js';

import routes from './routes.js';

const publicRouter = Router();

publicRouter.get(routes.public, getApprovedQuestions); // '/public'

publicRouter.post(routes.public, createQuestion); // '/public'

export default publicRouter;
