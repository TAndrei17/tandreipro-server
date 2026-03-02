import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import logout from '../src/routes/auth/logout.js';

const app = express();
app.use(cookieParser());
app.use(logout);

const generateToken = (role: 'admin' | 'user' = 'admin') => {
	return jwt.sign({ userId: 1, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

describe('POST /logout', () => {
	it('should clear the auth_token cookie and return 200', async () => {
		const token = generateToken('admin');
		// simulate cookie
		const res = await request(app)
			.post('/logout')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.success).toBeTruthy();
		expect(res.body.message).toBe('The session has ended.');

		// check that the cookie is cleared
		const setCookieHeader = res.headers['set-cookie'];
		expect(setCookieHeader).toBeDefined();

		// convert to array
		const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

		expect(cookies.some((cookie) => cookie.startsWith('auth_token=;'))).toBe(true);
	});
});
