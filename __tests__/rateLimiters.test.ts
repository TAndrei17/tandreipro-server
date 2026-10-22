import { describe, expect, it } from '@jest/globals';
import express from 'express';
import request from 'supertest';

import { createRateLimiter } from '../src/middlewares/rateLimiters.js';

const buildApp = (limit: number, skip?: () => boolean) => {
	const app = express();
	app.use(createRateLimiter({ windowMs: 60_000, limit, message: 'Too many requests.', skip }));
	app.get('/ping', (_req, res) => res.status(200).json({ success: true }));
	return app;
};

describe('createRateLimiter', () => {
	it('returns 429 with a JSON message after the limit is exceeded', async () => {
		const app = buildApp(2, () => false);

		await request(app).get('/ping').expect(200);
		await request(app).get('/ping').expect(200);
		const res = await request(app).get('/ping');

		expect(res.status).toBe(429);
		expect(res.body).toEqual({ success: false, message: 'Too many requests.' });
	});

	it('does not limit requests when skipped', async () => {
		const app = buildApp(1, () => true);

		await request(app).get('/ping').expect(200);
		await request(app).get('/ping').expect(200);
		await request(app).get('/ping').expect(200);
	});

	it('skips limiting under NODE_ENV=test by default', async () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = 'test';
		const app = buildApp(1);

		try {
			await request(app).get('/ping').expect(200);
			await request(app).get('/ping').expect(200);
		} finally {
			process.env.NODE_ENV = originalEnv;
		}
	});
});
