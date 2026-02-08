import 'dotenv/config';
import express from 'express';
import request from 'supertest';

import postQuestion from '@/routes/postQuestion.js';

import pool from '../src/db/pool.js';

const app = express();
app.use(express.json());
app.use(postQuestion);

afterAll(async () => {
	await pool.end();
});

describe('POST /questions', () => {
	it('returns 400 if data is missing', async () => {
		const res = await request(app)
			.post('/')
			.send({ name: '', email: '', question: 'Some question' });
		expect(res.status).toBe(400);
	});

	it('returns 201 if data is complete', async () => {
		const res = await request(app)
			.post('/')
			.send({ name: 'Mike Ross', email: 'suits@suits.org', question: 'Are you missing me?' });

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toHaveProperty('id');
		expect(res.body.data).toHaveProperty('created_at');

		// Checking directly in the database
		const dbCheck = await pool.query('SELECT * FROM questions WHERE id=$1', [res.body.data.id]);
		expect(dbCheck.rowCount).toBe(1);
	});
});
