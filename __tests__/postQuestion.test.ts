import 'dotenv/config';
import express from 'express';
import request from 'supertest';

import postQuestion from '@/routes/postQuestion.js';

import pool from '../src/db/pool.js';

const app = express();
app.use(express.json());
app.use(postQuestion);

afterAll(async () => {
	await pool.query('DELETE FROM questions WHERE name = $1', ['Marty McFly']);
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
		const res = await request(app).post('/').send({
			name: 'Marty McFly',
			email: 'backtothefuture@mail.org',
			question: 'Are you missing me?',
		});

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toHaveProperty('id');
		expect(res.body.data).toHaveProperty('created_at');

		// Checking directly in the database
		const dbCheck = await pool.query('SELECT * FROM questions WHERE id=$1', [res.body.data.id]);
		expect(dbCheck.rowCount).toBe(1);
	});

	it('returns 500 if there is a server error', async () => {
		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app).post('/').send({
			name: 'Marty McFly',
			email: 'backtothefuture@mail.org',
			question: 'Are you missing me?',
		});

		expect(res.status).toBe(500);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe('We’re sorry. We couldn’t receive your question.');

		// Restore the original method
		pool.query = originalQuery;
	});
});
