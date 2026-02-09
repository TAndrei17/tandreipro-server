import { Router, Request, Response } from 'express';

import { QuestionsPublic, QuestionsPublicResponse } from '@/types/Questions.js';

import routes from './routes.js';
import pool from '../db/pool.js';

const getQuestionsPublic = Router();

getQuestionsPublic.get(
	routes.questionsPublic,
	async (req: Request, res: Response<QuestionsPublicResponse>) => {
		try {
			const result = await pool.query(
				`SELECT id, name, content, created_at
			 FROM questions
			 WHERE approved = $1
			 `,
				[true],
			);

			const data: QuestionsPublic[] = result.rows.map((row) => ({
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

export default getQuestionsPublic;
