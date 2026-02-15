import { Request, Response } from 'express';

import pool from '../../db/pool.js';
import { AdminQuestionRequest, AdminQuestionResponse } from '../../types/adminPanelTypes.js';
import { Question } from '../../types/common/question.js';

const getAllQuestions = async (
	req: Request<{}, {}, {}, AdminQuestionRequest>,
	res: Response<AdminQuestionResponse>,
) => {
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
};

export default getAllQuestions;
