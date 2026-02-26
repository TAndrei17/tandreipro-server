import 'dotenv/config';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import router from '@/routes/index.js';

import pool from '../src/db/pool.js';

const app = express();
app.use(cookieParser());
app.use(router);

let originalEnv: string | undefined;
process.env.JWT_SECRET = 'testsecrettest';

// Create a test user in the database before tests
const testUser = {
	id: 200,
	username: 'admin-me',
	email: 'admin200@test.com',
	password: 'password200',
	role: 'admin',
	password_hash: '', // will be generated in beforeAll
};

const generateToken = (role: 'admin' | 'user' = 'admin') => {
	return jwt.sign({ userId: testUser.id, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

beforeAll(async () => {
	originalEnv = process.env.NODE_ENV;
	process.env.NODE_ENV = 'test';

	testUser.password_hash = await bcrypt.hash(testUser.password, 10);

	// Insert test user into the database
	await pool.query(
		`INSERT INTO users (id, username, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
		[testUser.id, testUser.username, testUser.email, testUser.password_hash, testUser.role],
	);
});

afterAll(async () => {
	// Remove test user from the database
	await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
	await pool.end();
	process.env.NODE_ENV = originalEnv;
});

describe('User authentication check', () => {
	// GET USER
	it('GET/ returns 401 without token', async () => {
		const res = await request(app).get('/auth/me');

		expect(res.status).toBe(401);
		expect(res.body.error).toBe('You are not authorized. Please log in.');
	});

	it('returns 200 if token is valid', async () => {
		const token = generateToken('admin');

		const res = await request(app)
			.get('/auth/me')
			.set('Cookie', [`auth_token=${token}`]);

		console.log('Ответ', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBeTruthy();
		expect(res.body.message).toBe('User is authenticated.');
	});

	it('GET /me returns 500 if DB fails', async () => {
		const token = generateToken('admin');
		// Mock pool.query to simulate a DB error
		const originalQuery = pool.query;
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app)
			.get('/auth/me')
			.set('Cookie', [`auth_token=${token}`]);

		expect(res.status).toBe(500);

		// Restore original query method
		pool.query = originalQuery;
	});
});
