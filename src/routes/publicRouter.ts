import { Router } from 'express';

import routes from './routes.js';
import createQuestion from '../services/public/createQuestion.js';
import getApprovedQuestions from '../services/public/getApprovedQuestions.js';

const publicRouter = Router();

publicRouter.get(
	routes.public, // '/public'
	getApprovedQuestions,
);

publicRouter.post(
	routes.public, // '/public'
	createQuestion,
);

export default publicRouter;
