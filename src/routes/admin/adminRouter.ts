import { Router } from 'express';

import createTag from '@/services/admin/createTag.js';
import deleteTag from '@/services/admin/deleteTag.js';

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

adminRouter.post(
	routes.adminTags, // '/admin/tags'
	requireAuth(),
	createTag,
);

adminRouter.delete(
	routes.adminTag, // '/admin/tags/:id'
	requireAuth(),
	deleteTag,
);

export default adminRouter;
