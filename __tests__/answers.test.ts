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

let originalEnv: string | undefined;

beforeAll(async () => {
	originalEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = 'test';
	await pool.query('DELETE FROM answers');
});

afterAll(async () => {
	await pool.query('DELETE FROM answers');
	await pool.end();
	process.env.NODE_ENV = originalEnv;
});

const generateToken = (role: 'admin' | 'user' = 'admin') => {
	return jwt.sign({ userId: 4, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

describe('CREATE ANSWER TESTS /admin', () => {
	it('POST/ returns 401 without token', async () => {
		const res = await request(app).post('/admin/answers').send({
			question_id: 1,
			content: 'This is an answer.',
		});

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('POST/ returns 400 if answer is not valid', async () => {
		const resQuestion = await request(app).post('/public/questions').send({
			name: 'Professor X',
			email: 'backtothefuture2@mail.org',
			question: 'Are you missing me? Really?',
			captchaToken: 'dummy-token',
		});

		expect(resQuestion.status).toBe(201);
		expect(resQuestion.body.data).toHaveProperty('id');

		const token = generateToken('admin');
		const resAnswer = await request(app)
			.post('/admin/answers')
			.send({
				question_id: resQuestion.body.data.id,
			})
			.set('Cookie', [`auth_token=${token}`]);

		expect(resAnswer.status).toBe(400);
		expect(resAnswer.body.success).toBe(false);
		expect(resAnswer.body.message).toBe('Missing required fields: question_id or content.');
	});

	it('POST/ returns 404 if answer is not exist', async () => {
		const unexistentQuestionId = 9999;

		const token = generateToken('admin');
		const resAnswer = await request(app)
			.post('/admin/answers')
			.send({
				question_id: unexistentQuestionId,
				content: 'This is an answer.',
			})
			.set('Cookie', [`auth_token=${token}`]);

		expect(resAnswer.status).toBe(404);
		expect(resAnswer.body.success).toBe(false);
		expect(resAnswer.body.message).toBe('Question not found.');
	});

	it('POST/ returns 201 if answer is valid', async () => {
		const resQuestion = await request(app).post('/public/questions').send({
			name: 'Marty McFly',
			email: 'backtothefuture@mail.org',
			question: 'Are you missing me?',
			captchaToken: 'dummy-token',
		});

		expect(resQuestion.status).toBe(201);
		expect(resQuestion.body.data).toHaveProperty('id');

		const token = generateToken('admin');
		const resAnswer = await request(app)
			.post('/admin/answers')
			.send({
				question_id: resQuestion.body.data.id,
				content: 'This is an answer.',
			})
			.set('Cookie', [`auth_token=${token}`]);

		expect(resAnswer.status).toBe(201);
		expect(resAnswer.body.success).toBe(true);
		expect(resAnswer.body.message).toBe('Your answer has been successfully submitted.');
	});

	it('POST/ returns 500 if there is a server error', async () => {
		const resQuestion = await request(app).post('/public/questions').send({
			name: 'Marty McFly',
			email: 'backtothefuture@mail.org',
			question: 'Are you missing me?',
			captchaToken: 'dummy-token',
		});

		expect(resQuestion.status).toBe(201);

		const originalQuery = pool.query;
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const token = generateToken('admin');
		try {
			const resAnswer = await request(app)
				.post('/admin/answers')
				.send({ question_id: resQuestion.body.data.id, content: 'This is an answer.' })
				.set('Cookie', [`auth_token=${token}`]);

			expect(resAnswer.status).toBe(500);
			expect(resAnswer.body.success).toBe(false);
			expect(resAnswer.body.message).toBe('We’re sorry. We couldn’t receive your answer.');
		} finally {
			pool.query = originalQuery;
		}
	});
});

describe('DELETE ANSWER TESTS /admin', () => {
	it('DELETE/ returns 401 without token', async () => {
		const res = await request(app).delete('/admin/answers/1');

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('DELETE/ returns 400 if invalid data is provided', async () => {
		const token = generateToken('admin');
		const res = await request(app)
			.delete('/admin/answers/abc')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(400);
		expect(res.body.message).toBe('Invalid id');
	});

	it('DELETE/ returns 200 if answer deleted successfully', async () => {
		const resQuestion = await request(app).post('/public/questions').send({
			name: 'Professor X',
			email: 'backtothefuture2@mail.org',
			question: 'Are you missing me? Really?',
			captchaToken: 'dummy-token',
		});
		expect(resQuestion.status).toBe(201);
		expect(resQuestion.body.data).toHaveProperty('id');

		const token = generateToken('admin');
		const resAnswer = await request(app)
			.post('/admin/answers')
			.send({
				question_id: resQuestion.body.data.id,
				content: 'This is an answer.',
			})
			.set('Cookie', [`auth_token=${token}`]);

		expect(resAnswer.status).toBe(201);
		expect(resAnswer.body.success).toBe(true);
		expect(resAnswer.body.data).toHaveProperty('id');

		const res = await request(app)
			.delete(`/admin/answers/${resAnswer.body.data.id}`)
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.message).toBe('Answer deleted successfully.');
	});

	it('DELETE/ returns 500 if there is a server error', async () => {
		const resQuestion = await request(app).post('/public/questions').send({
			name: 'Marty McFly',
			email: 'backtothefuture@mail.org',
			question: 'Are you missing me?',
			captchaToken: 'dummy-token',
		});
		expect(resQuestion.status).toBe(201);

		const token = generateToken('admin');
		const resAnswer = await request(app)
			.post('/admin/answers')
			.send({
				question_id: resQuestion.body.data.id,
				content: 'This is an answer.',
			})
			.set('Cookie', [`auth_token=${token}`]);

		expect(resAnswer.status).toBe(201);

		const originalQuery = pool.query;
		pool.query = async () => {
			throw new Error('DB failure');
		};

		try {
			const res = await request(app)
				.delete(`/admin/answers/${resAnswer.body.data.id}`)
				.set('Cookie', [`auth_token=${token}`]);

			expect(res.status).toBe(500);
			expect(res.body.message).toBe('Server error');
		} finally {
			pool.query = originalQuery;
		}
	});
});

describe('GET ALL ANSWERS /admin/answers', () => {
	it('GET/ returns 401 without token', async () => {
		const res = await request(app).get('/admin/answers');
		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('GET/ returns empty array if no answers exist', async () => {
		await pool.query('DELETE FROM answers');

		const token = generateToken('admin');
		const res = await request(app)
			.get('/admin/answers')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Data loaded successfully.');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(0);
	});

	it('GET/ returns all answers if they exist', async () => {
		const resQuestion = await request(app).post('/public/questions').send({
			name: 'Test User',
			email: 'testuser@mail.org',
			question: 'Sample question?',
			captchaToken: 'dummy-token',
		});
		expect(resQuestion.status).toBe(201);

		const token = generateToken('admin');
		const resAnswer = await request(app)
			.post('/admin/answers')
			.send({
				question_id: resQuestion.body.data.id,
				content: 'This is an answer.',
			})
			.set('Cookie', [`auth_token=${token}`]);
		expect(resAnswer.status).toBe(201);

		// GET /admin/answers
		const res = await request(app)
			.get('/admin/answers')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Data loaded successfully.');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThanOrEqual(1);

		const answer = res.body.data.find((a: any) => a.id === resAnswer.body.data.id);
		expect(answer).toBeDefined();
		expect(answer.content).toBe('This is an answer.');
		expect(answer.question_id).toBe(resQuestion.body.data.id);
		expect(answer).toHaveProperty('created_at');
	});

	it('GET/ returns 500 if there is a server error', async () => {
		const originalQuery = pool.query;
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const token = generateToken('admin');
		try {
			const res = await request(app)
				.get('/admin/answers')
				.set('Cookie', [`auth_token=${token}`]);

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('Server error');
		} finally {
			pool.query = originalQuery;
		}
	});
});

describe('GET PUBLIC ANSWERS /public', () => {
	it('GET/ returns empty array if no approved questions exist', async () => {
		await pool.query('DELETE FROM answers');
		await pool.query('DELETE FROM questions');

		const res = await request(app).get('/public/answers');

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Data loaded successfully.');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(0);
	});

	it('GET/ returns only answers for approved questions', async () => {
		const resQuestion1 = await request(app).post('/public/questions').send({
			name: 'User 1',
			email: 'user1@mail.org',
			question: 'Approved question?',
			captchaToken: 'dummy-token',
		});
		const resQuestion2 = await request(app).post('/public/questions').send({
			name: 'User 2',
			email: 'user2@mail.org',
			question: 'Unapproved question?',
			captchaToken: 'dummy-token',
		});
		expect(resQuestion1.status).toBe(201);
		expect(resQuestion2.status).toBe(201);

		await pool.query('UPDATE questions SET approved = $1 WHERE id = $2', [
			true,
			resQuestion1.body.data.id,
		]);

		const token = generateToken('admin');
		const resAnswer1 = await request(app)
			.post('/admin/answers')
			.send({
				question_id: resQuestion1.body.data.id,
				content: 'Answer for approved question.',
			})
			.set('Cookie', [`auth_token=${token}`]);
		const resAnswer2 = await request(app)
			.post('/admin/answers')
			.send({
				question_id: resQuestion2.body.data.id,
				content: 'Answer for unapproved question.',
			})
			.set('Cookie', [`auth_token=${token}`]);
		expect(resAnswer1.status).toBe(201);
		expect(resAnswer2.status).toBe(201);

		const res = await request(app).get('/public/answers');

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Data loaded successfully.');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(1);

		const answer = res.body.data[0];
		expect(answer.id).toBe(resAnswer1.body.data.id);
		expect(answer.question_id).toBe(resQuestion1.body.data.id);
		expect(answer.content).toBe('Answer for approved question.');
		expect(answer).toHaveProperty('created_at');
	});

	it('GET/ returns answers sorted by created_at ASC, id ASC', async () => {
		const resQuestion = await request(app).post('/public/questions').send({
			name: 'User 3',
			email: 'user3@mail.org',
			question: 'Another approved question?',
			captchaToken: 'dummy-token',
		});
		expect(resQuestion.status).toBe(201);

		await pool.query('UPDATE questions SET approved = $1 WHERE id = $2', [
			true,
			resQuestion.body.data.id,
		]);

		const token = generateToken('admin');
		const contents = ['First', 'Second', 'Third'];
		for (const content of contents) {
			const resAnswer = await request(app)
				.post('/admin/answers')
				.send({ question_id: resQuestion.body.data.id, content })
				.set('Cookie', [`auth_token=${token}`]);
			expect(resAnswer.status).toBe(201);
		}

		const res = await request(app).get('/public/answers');
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.length).toBeGreaterThanOrEqual(3);

		const createdAts = res.body.data.map((a: any) => new Date(a.created_at).getTime());
		for (let i = 1; i < createdAts.length; i++) {
			expect(createdAts[i]).toBeGreaterThanOrEqual(createdAts[i - 1]);
		}
	});

	it('GET/ returns 500 if there is a server error', async () => {
		const originalQuery = pool.query;
		pool.query = async () => {
			throw new Error('DB failure');
		};

		try {
			const res = await request(app).get('/public/answers');

			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('Unable to load data.');
		} finally {
			pool.query = originalQuery;
		}
	});
});

// npx jest --runInBand - запускает тесты последовательно, а не параллельно.
// важно, когда несколько тестов работают с одной базой
