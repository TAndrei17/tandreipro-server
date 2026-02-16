import 'dotenv/config';
import express from 'express';
import request from 'supertest';

import router from '@/routes/index.js';

import pool from '../src/db/pool.js';

const app = express();
app.use(express.json());
app.use(router);

afterAll(async () => {
	await pool.query('DELETE FROM questions');
	await pool.end();
});

describe('all actions /public/questions', () => {
	it('POST/ returns 400 if data is missing', async () => {
		const res = await request(app)
			.post('/public/questions')
			.send({ name: '', email: '', question: 'Some question' });

		expect(res.status).toBe(400);
	});

	it('POST/ returns 201 if data is complete', async () => {
		const res = await request(app).post('/public/questions').send({
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

	it('POST/ returns 500 if there is a server error', async () => {
		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app).post('/public/questions').send({
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

	it('GET/ returns 200 if data is received', async () => {
		await pool.query('UPDATE questions SET approved = $1 WHERE name = $2', [true, 'Marty McFly']);

		const res = await request(app).get('/public/questions');
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});

	it('GET/ returns 200 with empty array if no approved questions', async () => {
		await pool.query('UPDATE questions SET approved = $1', [false]);

		const res = await request(app).get('/public/questions');
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toEqual([]);
	});

	it('GET/ returns 500 if there is a server error', async () => {
		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app).get('/public/questions');

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});
});

// npx jest --runInBand - запускает тесты последовательно, а не параллельно.
// важно, когда несколько тестов работают с одной базой
