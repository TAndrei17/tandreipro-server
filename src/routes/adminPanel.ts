import { Router, Request, Response } from 'express';

import { requireAuth } from '@/middlewares/requireAuth.js';

import routes from './routes.js';

const adminPanel = Router();

adminPanel.get(routes.admin, requireAuth(), async (req: Request, res: Response) => {
	try {
		return res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: '' });
	}
});

export default adminPanel;
