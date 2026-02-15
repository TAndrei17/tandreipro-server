import { Router, Request, Response } from 'express';

import routes from './routes.js';
import pool from '../db/pool.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import {
	AdminQuestionDeleteRequest,
	AdminQuestionDeleteResponse,
	AdminQuestionRequest,
	AdminQuestionResponse,
} from '../types/adminPanelTypes.js';
import { Question } from '../types/common/question.js';

const adminPanel = Router();

adminPanel.get(
	routes.admin, // '/admin/'
	requireAuth(),
	async (req: Request<{}, {}, {}, AdminQuestionRequest>, res: Response<AdminQuestionResponse>) => {
		try {
			// --- Parse query parameters ---
			const page = parseInt(req.query.page ?? '1', 10); // default page = 1
			const limit = parseInt(req.query.limit ?? '100', 10); // default limit = 100
			const offset = (page - 1) * limit;

			// --- Fetch questions with stable order ---
			const result = await pool.query(
				`SELECT id, name, content, created_at
				 FROM questions
				 ORDER BY created_at DESC, id DESC
				 LIMIT $1 OFFSET $2`,
				[limit, offset],
			);

			const data: Question[] = result.rows.map((row) => ({
				id: row.id,
				name: row.name,
				content: row.content,
				created_at: row.created_at.toISOString(),
			}));

			// --- If no questions, return empty array only ---
			if (data.length === 0) {
				return res.status(200).json({
					success: true,
					message: 'Data loaded successfully.',
					data: [],
				});
			}

			// --- Fetch total count for pagination info ---
			const countResult = await pool.query('SELECT COUNT(*) FROM questions');
			const total = parseInt(countResult.rows[0].count, 10);

			return res.status(200).json({
				success: true,
				message: 'Data loaded successfully.',
				data,
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ success: false, message: 'Server error' });
		}
	},
);

adminPanel.delete(
	routes.adminQuestions, // '/admin/questions'
	requireAuth(),
	async (req: Request, res: Response<AdminQuestionDeleteResponse>) => {
		try {
			await pool.query('DELETE FROM questions');

			return res.status(200).json({
				success: true,
				message: 'All questions deleted successfully.',
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				success: false,
				message: 'Server error',
			});
		}
	},
);

adminPanel.delete(
	`${routes.adminQuestions}/:id`, // '/admin/questions/:id'
	requireAuth(),
	async (req: Request<AdminQuestionDeleteRequest>, res: Response<AdminQuestionDeleteResponse>) => {
		try {
			const id = Number(req.params.id);

			if (!Number.isInteger(id)) {
				return res.status(400).json({
					success: false,
					message: 'Invalid id',
				});
			}

			const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);

			if (result.rowCount === 0) {
				return res.status(404).json({
					success: false,
					message: 'Question not found.',
				});
			}

			return res.status(200).json({
				success: true,
				message: 'Question deleted successfully.',
			});
		} catch (error) {
			console.error(error);

			return res.status(500).json({
				success: false,
				message: 'Server error',
			});
		}
	},
);

export default adminPanel;
