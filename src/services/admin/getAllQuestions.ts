import { Request, Response } from 'express';

import pool from '../../db/pool.js';
import { AdminQuestionRequest, AdminQuestionResponse } from '../../types/adminTypes.js';
import { Question } from '../../types/common/question.js';

const getAllQuestions = async (
	req: Request<{}, {}, {}, AdminQuestionRequest>,
	res: Response<AdminQuestionResponse>,
) => {
	try {
		// Parse query parameters
		const page = parseInt(req.query.page ?? '1', 10); // default page = 1
		const limit = parseInt(req.query.limit ?? '100', 10); // default limit = 100
		const offset = (page - 1) * limit;

		// Fetch questions with their tag IDs
		const result = await pool.query(
			`SELECT 
				q.id AS question_id,
				q.name,
				q.email,
				q.content,
				q.approved,
				q.created_at,
				qt.tag_id
			FROM questions q
			LEFT JOIN question_tags qt ON q.id = qt.question_id
			ORDER BY q.created_at DESC, q.id DESC
			LIMIT $1 OFFSET $2`,
			[limit, offset],
		);

		// Map questions and collect tag IDs
		const questionsMap = new Map<number, Question>();

		result.rows.forEach((row) => {
			if (!questionsMap.has(row.question_id)) {
				questionsMap.set(row.question_id, {
					id: row.question_id,
					name: row.name,
					email: row.email,
					content: row.content,
					approved: row.approved,
					created_at: row.created_at.toISOString(),
					tags: [],
				});
			}
			if (row.tag_id) {
				questionsMap.get(row.question_id)?.tags?.push(row.tag_id);
			}
		});

		const data: Question[] = Array.from(questionsMap.values());

		// If no questions, return empty array only
		if (data.length === 0) {
			return res.status(200).json({
				success: true,
				message: 'Data loaded successfully.',
				data: [],
			});
		}

		// Fetch total count for pagination info
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
