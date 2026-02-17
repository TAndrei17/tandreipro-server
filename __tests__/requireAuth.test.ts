import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { AdminQuestionUpdateRequest } from '@/types/adminTypes.js';

import { AuthenticatedRequest, requireAuth } from '../src/middlewares/requireAuth.js';

const app = express();
app.use(cookieParser()); // parse cookies for middleware

// Test route protected by the middleware
app.get(
	'/protected',
	requireAuth('admin'),
	(req: AuthenticatedRequest<{ id: string }, {}, AdminQuestionUpdateRequest>, res) => {
		res.status(200).json({ message: 'Access granted', user: req.user });
	},
);

describe('requireAuth middleware', () => {
	const secret = 'test-secret';

	beforeAll(() => {
		process.env.JWT_SECRET = secret; // set secret for JWT
	});

	it('returns 401 if no token is provided', async () => {
		const res = await request(app).get('/protected');
		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('returns 401 if token is invalid', async () => {
		const res = await request(app).get('/protected').set('Cookie', ['auth_token=invalid-token']);
		expect(res.status).toBe(401);
		expect(res.body.error).toBe('Your session has expired. Please log in again.');
	});

	it('returns 403 if role does not match', async () => {
		const token = jwt.sign({ userId: 1, role: 'user' }, secret);
		const res = await request(app)
			.get('/protected')
			.set('Cookie', [`auth_token=${token}`]);
		expect(res.status).toBe(403);
		expect(res.body.error).toBe('You do not have permission to access this resource.');
	});

	it('returns 200 and user info if token is valid and role matches', async () => {
		const token = jwt.sign({ userId: 1, role: 'admin' }, secret);
		const res = await request(app)
			.get('/protected')
			.set('Cookie', [`auth_token=${token}`]);
		expect(res.status).toBe(200);
		expect(res.body.user).toEqual({ id: 1, role: 'admin' });
		expect(res.body.message).toBe('Access granted');
	});
});
