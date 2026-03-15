import { Request, Response } from 'express';

import { AdminAnswersResponse } from '@/types/adminTypes.js';

import pool from '../../db/pool.js';

const getAnswersForApprovedQuestions = async (
	req: Request,
	res: Response<AdminAnswersResponse>,
) => {
	try {
		// Fetch answers only for approved questions
		const result = await pool.query(
			`
      SELECT 
        a.id AS answer_id,
        a.question_id,
        a.content,
        a.created_at
      FROM answers a
      INNER JOIN questions q ON a.question_id = q.id
      WHERE q.approved = $1
      ORDER BY a.created_at ASC, a.id ASC
      `,
			[true],
		);

		return res.status(200).json({
			success: true,
			message: 'Data loaded successfully.',
			data: result.rows.map((row) => ({
				id: row.answer_id,
				question_id: row.question_id,
				content: row.content,
				created_at: row.created_at.toISOString(),
			})),
		});
	} catch {
		return res.status(500).json({ success: false, message: 'Unable to load data.' });
	}
};

export default getAnswersForApprovedQuestions;
