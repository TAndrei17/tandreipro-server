import { Router, Request, Response } from 'express';

// import pool from '@db/pool.js';

import { QuestionsPublicResponse } from '@/types/Questions.js';

import routes from './routes.js';

const getQuestionsPublic = Router();

getQuestionsPublic.get(
	routes.questionsPublic,
	async (req: Request, res: Response<QuestionsPublicResponse>) => {
		try {
			return res.status(200).json({ success: true, message: '', data: [] });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ success: false, message: '' });
		}
	},
);

export default getQuestionsPublic;
