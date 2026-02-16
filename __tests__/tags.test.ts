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
	await pool.query('DELETE FROM tags');
});

afterAll(async () => {
	await pool.query('DELETE FROM tags');
	await pool.end();
});

const generateToken = (role: 'admin' | 'user' = 'admin') => {
	return jwt.sign({ userId: 1, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

describe('All actions /tags', () => {
	// CREATE TAGS
	it('POST/ returns 401 without token', async () => {
		const res = await request(app).post('/admin/tags').send({ tag: 'Test' });
		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('POST/ returns 400 if tag is falsy', async () => {
		const token = generateToken('admin');
		const postRes = await request(app)
			.post('/admin/tags')
			.set('Cookie', [`auth_token=${token}`])
			.send({
				tag: '',
			});

		expect(postRes.body.success).toBe(false);
		expect(postRes.body.message).toBe('Tag name is required and must be a non-empty string.');
	});

	it('POST/ returns 200 if tag is correct', async () => {
		const token = generateToken('admin');
		const postRes = await request(app)
			.post('/admin/tags')
			.set('Cookie', [`auth_token=${token}`])
			.send({
				tag: 'Websites',
			});

		expect(postRes.body.success).toBe(true);
		expect(postRes.body.message).toBe('Tag is created successfully.');
	});

	it('POST/ returns 409 if tag is in the base', async () => {
		const token = generateToken('admin');
		await request(app)
			.post('/admin/tags')
			.set('Cookie', [`auth_token=${token}`])
			.send({
				tag: 'AppMobile',
			});

		const postRes = await request(app)
			.post('/admin/tags')
			.set('Cookie', [`auth_token=${token}`])
			.send({
				tag: 'AppMobile',
			});

		expect(postRes.body.success).toBe(false);
		expect(postRes.body.message).toBe('Tag already exists.');
	});

	it('POST/ returns 500 if there is a server error', async () => {
		const token = generateToken('admin');
		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app)
			.post('/admin/tags')
			.set('Cookie', [`auth_token=${token}`])
			.send({ tag: 'Test2' });

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});

	// GET TAGS
	it('GET/ returns 200 for all tags or empty tags array', async () => {
		const res = await request(app).get('/public/tags');

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Data loaded successfully.');
	});

	it('GET/ returns 500 if there is a server error', async () => {
		// Save the original method
		const originalQuery = pool.query;

		// Replace it with a function that throws an error
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app).get('/public/tags');

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});

	// DELETE TAG
	it('DELETE/ returns 401 without token', async () => {
		const res = await request(app).delete('/admin/tags/1');
		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('DELETE/ returns 400 if ID is incorrect', async () => {
		const token = generateToken('admin');
		const deleteRes = await request(app)
			.delete('/admin/tags/abc')
			.set('Cookie', [`auth_token=${token}`]);

		expect(deleteRes.status).toBe(400);
		expect(deleteRes.body.success).toBe(false);
		expect(deleteRes.body.message).toBe('Invalid id.');
	});

	it('DELETE/ returns 404 if ID is not exist', async () => {
		const token = generateToken('admin');

		const res = await request(app)
			.post('/admin/tags')
			.set('Cookie', [`auth_token=${token}`])
			.send({
				tag: 'AppMobile-Test',
			});

		const notexistId = res.body.data.id + 100;

		const deleteRes = await request(app)
			.delete(`/admin/tags/${notexistId}`)
			.set('Cookie', [`auth_token=${token}`]);

		expect(deleteRes.status).toBe(404);
		expect(deleteRes.body.success).toBe(false);
		expect(deleteRes.body.message).toBe('Tag not found.');
	});

	it('DELETE/ returns 200 if tag is deleted', async () => {
		const token = generateToken('admin');
		const res = await request(app)
			.post('/admin/tags')
			.set('Cookie', [`auth_token=${token}`])
			.send({
				tag: 'AppMobile-Test-2',
			});

		const id = res.body.data.id;

		const deleteRes = await request(app)
			.delete(`/admin/tags/${id}`)
			.set('Cookie', [`auth_token=${token}`]);

		expect(deleteRes.status).toBe(200);
		expect(deleteRes.body.success).toBe(true);
		expect(deleteRes.body.message).toBe('Tag deleted successfully.');
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
			.delete('/admin/tags/1')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(500);

		// Restore the original method
		pool.query = originalQuery;
	});
});

// npx jest --runInBand - запускает тесты последовательно, а не параллельно.
// важно, когда несколько тестов работают с одной базой
