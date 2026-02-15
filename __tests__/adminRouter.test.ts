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

beforeAll(async () => {
	await pool.query('DELETE FROM questions');
});

afterAll(async () => {
	await pool.query('DELETE FROM questions');
	await pool.end();
});

const generateToken = (role: 'admin' | 'user' = 'admin') => {
	return jwt.sign({ userId: 1, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

describe('All actions /admin', () => {
	// GET ALL QUESTIONS
	it('GET/ returns 401 without token', async () => {
		const res = await request(app).get('/admin/questions');

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('GET/ returns 200 with empty array', async () => {
		const token = generateToken('admin');

		const res = await request(app)
			.get('/admin/questions')
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
			.get('/admin/questions')
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
			.get('/admin/questions')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});

	// UPDATE QUESTION
	it('GET/ returns 401 without token', async () => {
		const res = await request(app).patch('/admin/questions/10');

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('PATCH/ returns 400 if id is incorrect', async () => {
		const postRes = await request(app).post('/public').send({
			name: 'Juan Carlos II',
			email: 'rey@gmail.com',
			question: '¡Soy el Rey del Mundo!',
		});

		expect(postRes.body.success).toBe(true);

		const token = generateToken('admin');

		const res = await request(app)
			.patch('/admin/questions/abc')
			.set('Cookie', [`auth_token=${token}`])
			.send({ name: 'Juan' });

		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe('Invalid id.');
	});

	it('PATCH/ returns 400 without update data', async () => {
		const postRes = await request(app).post('/public').send({
			name: 'Mike Ross',
			email: 'layer@gmail.com',
			question: 'I am loyal',
		});

		expect(postRes.body.success).toBe(true);
		const insertedId = postRes.body.data.id;

		const token = generateToken('admin');

		const res = await request(app)
			.patch(`/admin/questions/${insertedId}`)
			.set('Cookie', [`auth_token=${token}`])
			.send({});

		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe('No fields to update.');
	});

	it('PATCH/ returns 200 if data is updated', async () => {
		const postRes = await request(app).post('/public').send({
			name: 'Alexander Second',
			email: 'king@mail.com',
			question: 'I am the King!',
		});

		expect(postRes.body.success).toBe(true);
		const insertedId = postRes.body.data.id;

		const token = generateToken('admin');

		const res = await request(app)
			.patch(`/admin/questions/${insertedId}`)
			.set('Cookie', [`auth_token=${token}`])
			.send({ name: 'Alexander Nikolaevich', content: 'Am I King really?', approved: true });

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Data updated successfully.');

		// Checking directly in the database
		const dbCheck = await pool.query('SELECT * FROM questions WHERE id=$1', [insertedId]);
		expect(dbCheck.rowCount).toBe(1);
		const updated = dbCheck.rows[0];
		expect(updated.name).toBe('Alexander Nikolaevich');
		expect(updated.content).toBe('Am I King really?');
		expect(updated.approved).toBe(true);
	});

	it('PATCH/ returns 500 if there is a server error', async () => {
		const postRes = await request(app).post('/public').send({
			name: 'Alexander',
			email: 'kinggreate@mail.com',
			question: 'I am the King of Greece!',
		});

		expect(postRes.body.success).toBe(true);
		const insertedId = postRes.body.data.id;

		const token = generateToken('admin');

		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app)
			.patch(`/admin/questions/${insertedId}`)
			.set('Cookie', [`auth_token=${token}`])
			.send({ content: 'I am greate!' });

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});

	// DELETE ONE QUESTION
	it('DELETE/ returns 401 without token', async () => {
		const res = await request(app).delete('/admin/questions/1');

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('DELETE/ returns 400 if data is not found', async () => {
		const postRes = await request(app).post('/public').send({
			name: 'John Connor',
			email: 'sarahson@mail.com',
			question: 'I protected the world',
		});

		expect(postRes.body.success).toBe(true);

		const token = generateToken('admin');
		const nonExistentId = postRes.body.data.id + 9999;

		const res = await request(app)
			.delete(`/admin/questions/${nonExistentId}`)
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(404);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toBe('Question not found.');
	});

	it('DELETE/ returns 200 if data is deleted', async () => {
		const postRes = await request(app).post('/public').send({
			name: 'Billy Willy',
			email: 'microsoft@outlook.com',
			question: 'I created Windows twice',
		});

		expect(postRes.body.success).toBe(true);

		const token = generateToken('admin');

		const res = await request(app)
			.delete(`/admin/questions/${postRes.body.data.id}`)
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Question deleted successfully.');
	});

	it('DELETE/ returns 500 if there is a server error', async () => {
		const token = generateToken('admin');
		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app)
			.delete('/admin/questions/1')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});

	// DELETE ALL QUESTIONS
	it('DELETE/ returns 401 without token', async () => {
		const res = await request(app).delete('/admin/questions');

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('DELETE/ returns 200 if data is deleted', async () => {
		const postResOne = await request(app).post('/public').send({
			name: 'Bill Gates',
			email: 'microsoft@outlook.com',
			question: 'I created Windows',
		});

		const postResTwo = await request(app).post('/public').send({
			name: 'Billy',
			email: 'microsoft@outlook.com',
			question: 'I created Windows again',
		});

		expect(postResOne.body.success).toBe(true);
		expect(postResTwo.body.success).toBe(true);

		const token = generateToken('admin');

		const res = await request(app)
			.delete('/admin/questions')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('All questions deleted successfully.');

		// Checking directly in the database
		const dbCheck = await pool.query('SELECT * FROM questions', []);
		expect(dbCheck.rowCount).toBe(0);
	});

	it('DELETE/ returns 500 if there is a server error', async () => {
		const token = generateToken('admin');
		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app)
			.delete('/admin/questions')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});
});

// npx jest --runInBand - запускает тесты последовательно, а не параллельно.
// важно, когда несколько тестов работают с одной базой
