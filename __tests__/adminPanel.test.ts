import 'dotenv/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import router from '@/routes/index.js';

import pool from '../src/db/pool.js';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(router);

afterAll(async () => {
	await pool.query('DELETE FROM questions');
	await pool.end();
});

const generateToken = (role: 'admin' | 'user' = 'admin') => {
	return jwt.sign({ userId: 1, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

describe('all actions /admin', () => {
	it('GET/ returns 401 without token', async () => {
		const res = await request(app).get('/admin');

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('GET/ returns 200 with empty array', async () => {
		const token = generateToken('admin');

		const res = await request(app)
			.get('/admin')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Data loaded successfully.');
		expect(res.body.data).toEqual([]);
	});

	it('GET/ returns 200 if data is received', async () => {
		const postRes = await request(app).post('/public').send({
			name: 'Bill Gates',
			email: 'microsoft@outlook.com',
			question: 'I created Windows',
		});

		expect(postRes.body.success).toBe(true);
		const insertedId = postRes.body.data.id;

		const token = generateToken('admin');

		const res = await request(app)
			.get('/admin')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Data loaded successfully.');

		// Checking directly in the database
		const dbCheck = await pool.query('SELECT * FROM questions WHERE id=$1', [insertedId]);
		expect(dbCheck.rowCount).toBe(1);
	});

	it('GET/ returns 500 if there is a server error', async () => {
		const token = generateToken('admin');
		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app)
			.get('/admin')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});
});

// npx jest --runInBand - запускает тесты последовательно, а не параллельно.
// важно, когда несколько тестов работают с одной базой
