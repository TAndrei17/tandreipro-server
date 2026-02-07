import express from 'express';
import request from 'supertest';

import logout from '../src/routes/logout.js';

const app = express();
app.use(logout);

describe('POST /logout', () => {
	it('should clear the auth_token cookie and return 200', async () => {
		// simulate cookie
		const res = await request(app).post('/logout').set('Cookie', ['auth_token=dummy-token']);

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
