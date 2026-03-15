import { Router } from 'express';

import createQuestion from '../../services/public/createQuestion.js';
import getAnswersForApprovedQuestions from '../../services/public/getAnswersForApprovedQuestions.js';
import getApprovedQuestions from '../../services/public/getApprovedQuestions.js';
import getTags from '../../services/public/getTags.js';
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

publicRouter.get(
	routes.publicAnswers, // '/public/answers'
	getAnswersForApprovedQuestions,
);

export default publicRouter;
