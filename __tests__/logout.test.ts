import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import logout from '../src/routes/logout.js';

const app = express();
app.use(cookieParser());
app.use(logout);

const generateToken = (role: 'admin' | 'user' = 'admin') => {
	return jwt.sign({ userId: 1, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

describe('POST /logout', () => {
	it('POST/ returns 401 without token', async () => {
		const res = await request(app).post('/logout');

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('should clear the auth_token cookie and return 200', async () => {
		const token = generateToken('admin');
		// simulate cookie
		const res = await request(app)
			.post('/logout')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ success: true });

		// check that the cookie is cleared
		const setCookieHeader = res.headers['set-cookie'];
		expect(setCookieHeader).toBeDefined();

		// convert to array
		const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];

		expect(cookies.some((cookie) => cookie.startsWith('auth_token=;'))).toBe(true);
	});
});
