import { Router, Request, Response } from 'express';

import {
	PublicQuestion,
	PublicAllQuestionsResponse,
	PublicQuestionRequest,
	PublicQuestionResponse,
} from '@/types/publicQuestionsTypes.js';

import routes from './routes.js';
import pool from '../db/pool.js';

const publicQuestions = Router();

publicQuestions.get(
	routes.public,
	async (req: Request, res: Response<PublicAllQuestionsResponse>) => {
		try {
			const result = await pool.query(
				`SELECT id, name, content, created_at
			 FROM questions
			 WHERE approved = $1
			 `,
				[true],
			);

			const data: PublicQuestion[] = result.rows.map((row) => ({
				id: row.id,
				name: row.name,
				content: row.content,
				created_at: row.created_at.toISOString(),
			}));

			return res.status(200).json({ success: true, message: 'Data loaded successfully.', data });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ success: false, message: 'Unable to load data.' });
		}
	},
);

publicQuestions.post(
	routes.public,
	async (req: Request<{}, {}, PublicQuestionRequest>, res: Response<PublicQuestionResponse>) => {
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
	},
);

export default publicQuestions;
