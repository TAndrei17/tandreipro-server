import { Router } from 'express';

import getTags from '@/services/public/getTags.js';

import createQuestion from '../../services/public/createQuestion.js';
import getApprovedQuestions from '../../services/public/getApprovedQuestions.js';
import routes from '../routes.js';

const publicRouter = Router();

publicRouter.get(
	routes.public, // '/public/questions'
	getApprovedQuestions,
);

publicRouter.post(
	routes.public, // '/public/questions'
	createQuestion,
);

publicRouter.get(
	routes.publicTags, // '/public/tags'
	getTags,
);

export default publicRouter;
