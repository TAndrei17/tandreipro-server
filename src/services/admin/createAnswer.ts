import { Response } from 'express';

import { AuthenticatedRequest } from '@/middlewares/requireAuth.js';
import { AdminAnswerRequest, AdminAnswerResponse } from '@/types/adminTypes.js';

import pool from '../../db/pool.js';

const createAnswer = async (
	req: AuthenticatedRequest<{}, {}, AdminAnswerRequest>,
	res: Response<AdminAnswerResponse>,
) => {
	try {
		const { question_id, content } = req.body;

		if (!question_id || !content) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields: question_id or content.',
			});
		}

		const question = await pool.query('SELECT id FROM questions WHERE id = $1', [question_id]);
		if (question.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: 'Question not found.',
			});
		}

		const userId = req.user?.id;
		const result = await pool.query(
			'INSERT INTO answers (question_id, admin_id, content) VALUES ($1, $2, $3) RETURNING id, created_at',
			[question_id, userId, content],
		);

		if (result.rowCount === 0) {
			throw new Error('We’re sorry. Something went wrong while saving your request.');
		}

		return res.status(201).json({
			success: true,
			message: 'Your answer has been successfully submitted.',
			data: result.rows[0],
		});
	} catch {
		return res
			.status(500)
			.json({ success: false, message: 'We’re sorry. We couldn’t receive your answer.' });
	}
};

export default createAnswer;
