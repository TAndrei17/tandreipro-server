import { Request, Response } from 'express';

import pool from '../../db/pool.js';
import { PublicQuestionRequest, PublicQuestionResponse } from '../../types/publicQuestionsTypes.js';

const createQuestion = async (
	req: Request<{}, {}, PublicQuestionRequest>,
	res: Response<PublicQuestionResponse>,
) => {
	try {
		const { name, email, question } = req.body;

		if (!name || !email || !question) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields',
				fields: {
					name: !name ? 'Required' : undefined,
					email: !email ? 'Required' : undefined,
					question: !question ? 'Required' : undefined,
				},
			});
		}

		const result = await pool.query(
			'INSERT INTO questions (name, email, content) VALUES ($1, $2, $3) RETURNING id, created_at',
			[name, email, question],
		);

		if (result.rowCount === 0) {
			throw new Error('We’re sorry. Something went wrong while saving your request.');
		}

		return res.status(201).json({
			success: true,
			message: 'Your question has been successfully submitted.',
			data: result.rows[0],
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ success: false, message: 'We’re sorry. We couldn’t receive your question.' });
	}
};

export default createQuestion;
