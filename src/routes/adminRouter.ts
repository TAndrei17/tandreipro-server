import { Router } from 'express';

import deleteAllQuestions from '@/services/admin/deleteAllQuestions.js';
import deleteQuestion from '@/services/admin/deleteQuestion.js';
import getAllQuestions from '@/services/admin/getAllQuestions.js';

import routes from './routes.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const adminRouter = Router();

adminRouter.get(
	routes.admin, // '/admin/'
	requireAuth(),
	getAllQuestions,
);

adminRouter.delete(
	routes.adminQuestions, // '/admin/questions'
	requireAuth(),
	deleteAllQuestions,
);

adminRouter.delete(
	routes.adminQuestionOne, // '/admin/questions/:id'
	requireAuth(),
	deleteQuestion,
);

export default adminRouter;
