import express from 'express';
import request from 'supertest';

import login from '../src/routes/login.js';

const app = express();
app.use(express.json());
app.use(login);

describe('POST /login (integration)', () => {
	it('returns 400 if email or password is missing', async () => {
		const res = await request(app).post('/login').send({});
		expect(res.status).toBe(400);
	});
});
