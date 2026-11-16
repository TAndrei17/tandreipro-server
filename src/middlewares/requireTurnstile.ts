import { NextFunction, Request, Response } from 'express';

import { verifyTurnstile } from '../utils/verifyTurnstile.js';

export async function requireTurnstile(req: Request, res: Response, next: NextFunction) {
	const token: unknown = req.body?.turnstileToken;
	if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
		return res.status(400).json({ success: false, message: 'A valid Turnstile token is required.' });
	}

	try {
		const result = await verifyTurnstile(token);
		if (result?.success !== true) {
			return res.status(403).json({ success: false, message: 'Turnstile verification failed.' });
		}
		return next();
	} catch {
		console.error('Turnstile verification service is unavailable or not configured.');
		return res.status(503).json({ success: false, message: 'Turnstile verification is unavailable. Please try again.' });
	}
}
