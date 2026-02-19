import { Request, Response } from 'express';

import pool from '../../db/pool.js';
import { Question } from '../../types/common/question.js';
import { PublicAllQuestionsResponse } from '../../types/publicTypes.js';

const getApprovedQuestions = async (req: Request, res: Response<PublicAllQuestionsResponse>) => {
	try {
		// Fetch approved questions with their tag IDs
		const result = await pool.query(
			`SELECT 
				q.id AS question_id,
				q.name,
				q.content,
				q.approved,
				q.created_at,
				qt.tag_id
			FROM questions q
			LEFT JOIN question_tags qt ON q.id = qt.question_id
			WHERE q.approved = $1
			ORDER BY q.created_at DESC, q.id DESC`,
			[true],
		);

		// Map questions and collect tag IDs
		const questionsMap = new Map<number, Question>();

		result.rows.forEach((row) => {
			if (!questionsMap.has(row.question_id)) {
				questionsMap.set(row.question_id, {
					id: row.question_id,
					name: row.name,
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

		return res.status(200).json({
			success: true,
			message: 'Data loaded successfully.',
			data,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, message: 'Unable to load data.' });
	}
};

export default getApprovedQuestions;
