import 'dotenv/config';
import bcrypt from 'bcrypt';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import pool from '../src/db/pool.js';
import login from '../src/routes/login.js';

// Test Express app
const app = express();
app.use(express.json());
app.use(login);

// Mock JWT secret
process.env.JWT_SECRET = 'testsecret';

// Create a test user in the database before tests
const testUser = {
	id: '11111111-1111-1111-1111-111111111111',
	username: 'admin',
	email: 'admin@test.com',
	password: 'password123',
	role: 'admin',
	password_hash: '', // will be generated in beforeAll
};

beforeAll(async () => {
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
});

describe('POST /login (integration)', () => {
	it('returns 400 if email or password is missing', async () => {
		const res = await request(app).post('/login').send({});
		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Unable to log in. Please verify your email and password.');
	});

	it('returns 401 if user does not exist', async () => {
		const res = await request(app)
			.post('/login')
			.send({ email: 'nonexistent@test.com', password: 'password123' });
		expect(res.status).toBe(401);
		expect(res.body.error).toBe('Unable to log in. Please verify your email and password.');
	});

	it('returns 401 if password is incorrect', async () => {
		const res = await request(app)
			.post('/login')
			.send({ email: testUser.email, password: 'wrongpassword' });
		expect(res.status).toBe(401);
		expect(res.body.error).toBe('Unable to log in. Please verify your email and password.');
	});

	it('returns 200 and sets auth_token cookie if login is successful', async () => {
		const res = await request(app)
			.post('/login')
			.send({ email: testUser.email, password: testUser.password });

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.role).toBe(testUser.role);

		// Verify that cookie is set
		const cookies = res.headers['set-cookie'];
		expect(cookies).toBeDefined();

		// Convert to array if needed
		const cookieArray = Array.isArray(cookies) ? cookies : [cookies];

		// Check that auth_token cookie exists
		expect(cookieArray.some((c) => c.startsWith('auth_token='))).toBe(true);

		// Verify JWT contents
		const token = cookies[0].split(';')[0].split('=')[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET!);
		expect(decoded).toHaveProperty('userId', testUser.id);
		expect(decoded).toHaveProperty('role', testUser.role);
	});

	it('returns 500 if there is a server error', async () => {
		// Mock pool.query to simulate a DB error
		const originalQuery = pool.query;
		pool.query = async () => {
			throw new Error('DB failure');
		};

		const res = await request(app)
			.post('/login')
			.send({ email: testUser.email, password: testUser.password });

		expect(res.status).toBe(500);

		// Restore original query method
		pool.query = originalQuery;
	});
});
