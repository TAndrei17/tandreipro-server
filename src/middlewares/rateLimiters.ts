import { rateLimit } from 'express-rate-limit';

interface RateLimiterOptions {
	windowMs: number;
	limit: number;
	message: string;
	skip?: () => boolean;
}

// Tests send many requests from one address, so limiting is off under NODE_ENV=test
const isTestEnv = () => process.env.NODE_ENV === 'test';

export const createRateLimiter = ({
	windowMs,
	limit,
	message,
	skip = isTestEnv,
}: RateLimiterOptions) =>
	rateLimit({
		windowMs,
		limit,
		standardHeaders: 'draft-7',
		legacyHeaders: false,
		skip,
		handler: (_req, res) => {
			res.status(429).json({ success: false, message });
		},
	});

export const loginRateLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	message: 'Too many login attempts. Please try again later.',
});

export const createQuestionRateLimiter = createRateLimiter({
	windowMs: 60 * 60 * 1000,
	limit: 10,
	message: 'Too many questions submitted. Please try again later.',
});
