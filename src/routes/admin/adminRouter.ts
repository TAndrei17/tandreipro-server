import { Router } from 'express';

import { requireAuth } from '../../middlewares/requireAuth.js';
import deleteAllQuestions from '../../services/admin/deleteAllQuestions.js';
import deleteQuestion from '../../services/admin/deleteQuestion.js';
import getAllQuestions from '../../services/admin/getAllQuestions.js';
import updateQuestion from '../../services/admin/updateQuestion.js';
import routes from '../routes.js';

const adminRouter = Router();

adminRouter.get(
	routes.adminQuestions, // '/admin/questions'
	requireAuth(),
	getAllQuestions,
);

adminRouter.delete(
	routes.adminQuestions, // '/admin/questions'
	requireAuth(),
	deleteAllQuestions,
);

adminRouter.patch(
	routes.adminQuestionOne, // '/admin/questions/:id'
	requireAuth(),
	updateQuestion,
);

adminRouter.delete(
	routes.adminQuestionOne, // '/admin/questions/:id'
	requireAuth(),
	deleteQuestion,
);

export default adminRouter;
