import { Request, Response } from 'express';

import pool from '../../db/pool.js';
import { PublicQuestionRequest, PublicQuestionResponse } from '../../types/publicTypes.js';
import { verifyCaptcha } from '../../utils/verifyCaptcha.js';

const createQuestion = async (
	req: Request<{}, {}, PublicQuestionRequest>,
	res: Response<PublicQuestionResponse>,
) => {
	try {
		const { name, email, question, captchaToken } = req.body;

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

		if (question.length < 10) {
			return res.status(400).json({ success: false, message: 'The question is too short.' });
		}

		if (question.length > 2000) {
			return res.status(400).json({ success: false, message: 'The question is too long.' });
		}

		if (!captchaToken) {
			return res.status(400).json({ success: false, message: 'CAPTCHA token is missing' });
		}

		const ENV_PROD = process.env.NODE_ENV === 'production';
		const secret = ENV_PROD ? process.env.KEY_SECRET_CAPTCHA : process.env.KEY_SECRET_CAPTCHA_DEV;
		if (!secret) {
			throw new Error('CAPTCHA secret key is not set in env variables');
		}

		// CAPTCHA checking
		const captchaData = await verifyCaptcha(captchaToken);

		if (!captchaData.success) {
			return res.status(403).json({ success: false, message: 'CAPTCHA verification failed.' });
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
		console.error('Error creating question:', error);
		return res
			.status(500)
			.json({ success: false, message: 'We’re sorry. We couldn’t receive your question.' });
	}
};

export default createQuestion;
