import axios from 'axios';

import { TurnstileResponse } from '../types/publicTypes.js';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const VERIFY_TIMEOUT_MS = 5000;

export async function verifyTurnstile(token: string): Promise<TurnstileResponse> {
	if (process.env.NODE_ENV === 'test') {
		return { success: true, hostname: 'localhost' };
	}

	const secret = process.env.TURNSTILE_SECRET_KEY!;

	try {
		const { data } = await axios.post<TurnstileResponse>(
			VERIFY_URL,
			new URLSearchParams({ secret, response: token }),
			{
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				timeout: VERIFY_TIMEOUT_MS,
			},
		);

		return data;
	} catch {
		return { success: false, 'error-codes': ['verification-unavailable'] };
	}
}
