import 'dotenv/config';
import express from 'express';
import request from 'supertest';

import getQuestionsPublic from '@/routes/getQuestionsPublic.js';

import pool from '../src/db/pool.js';

const app = express();
app.use(express.json());
app.use(getQuestionsPublic);

beforeAll(async () => {
	await pool.query('UPDATE questions SET approved = $1 WHERE id = $2', [true, 1]);
});

afterAll(async () => {
	await pool.query('UPDATE questions SET approved = $1 WHERE id = $2', [false, 1]);
	await pool.end();
});

describe('GET /questions', () => {
	it('returns 200 if data is received', async () => {
		const res = await request(app).get('/public');

		expect(res.status).toBe(200);
		expect(res.headers['content-type']).toMatch(/json/);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toContainEqual({
			content: 'Are you missing me?',
			created_at: '2026-02-08T18:59:05.341Z',
			id: 1,
			name: 'Mike Ross',
		});
	});

	it('returns 200 with empty array if no approved questions', async () => {
		await pool.query('UPDATE questions SET approved = $1', [false]);

		const res = await request(app).get('/public');
		expect(res.status).toBe(200);
		expect(res.headers['content-type']).toMatch(/json/);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toEqual([]);

		// Restore state after the test
		await pool.query('UPDATE questions SET approved = $1 WHERE id = $2', [true, 1]);
	});

	it('returns 500 if there is a server error', async () => {
		// Mock pool.query to simulate a DB error
		const originalQuery = pool.query;
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app).get('/public');

		expect(res.status).toBe(500);

		// Restore original query method
		pool.query = originalQuery;
	});
});
