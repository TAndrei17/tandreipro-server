import { Router, Request, Response } from 'express';

import { requireAuth } from '@/middlewares/requireAuth.js';

import routes from './routes.js';

const logout = Router();

logout.post(routes.logout, requireAuth(), async (req: Request, res: Response) => {
	try {
		res.clearCookie('auth_token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		});

		return res.status(200).json({ success: true });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Logout failed. Please try again.' });
	}
});

export default logout;
