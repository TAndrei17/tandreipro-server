import axios from 'axios';

import { RecaptchaResponse } from '../types/publicTypes.js';

export async function verifyCaptcha(token: string): Promise<RecaptchaResponse> {
	if (process.env.NODE_ENV === 'test') {
		return { success: true, hostname: 'localhost' };
	}

	const secret =
		process.env.NODE_ENV === 'production'
			? process.env.KEY_SECRET_CAPTCHA!
			: process.env.KEY_SECRET_CAPTCHA_DEV!;

	const { data } = await axios.post<RecaptchaResponse>(
		'https://www.google.com/recaptcha/api/siteverify',
		new URLSearchParams({ secret, response: token }),
		{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
	);

	return data;
}
