import { Router } from 'express';

import deleteAllQuestions from '@/services/admin/deleteAllQestions.js';
import deleteQuestion from '@/services/admin/deleteQuestion.js';
import getAllQuestions from '@/services/admin/getAllQuestions.js';

import routes from './routes.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const adminPanel = Router();

adminPanel.get(
	routes.admin, // '/admin/'
	requireAuth(),
	getAllQuestions,
);

adminPanel.delete(
	routes.adminQuestions, // '/admin/questions'
	requireAuth(),
	deleteAllQuestions,
);

adminPanel.delete(
	routes.adminQuestionOne, // '/admin/questions/:id'
	requireAuth(),
	deleteQuestion,
);

export default adminPanel;
