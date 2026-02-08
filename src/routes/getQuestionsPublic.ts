import { Router, Request, Response } from 'express';

// import pool from '@db/pool.js';

import routes from './routes.js';

const getQuestionsPublic = Router();

getQuestionsPublic.get(routes.questionsPublic, async (req: Request, res: Response) => {
	try {
		return res.status(200).json({});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: '' });
	}
});

export default getQuestionsPublic;
