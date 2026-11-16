import { randomBytes } from 'node:crypto';

import { afterAll, afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import axios from 'axios';
import bcrypt from 'bcrypt';
import express from 'express';
import request from 'supertest';

import pool from '../src/db/pool.js';
import router from '../src/routes/index.js';

const app = express();
app.use(express.json());
app.use(router);

const originalSecret = process.env.TURNSTILE_SECRET_KEY;
const secret = randomBytes(32).toString('hex');
const token = randomBytes(32).toString('hex');
const endpoints = [
	{ path: '/auth/login', body: { email: 'admin@example.invalid', password: 'password' } },
	{ path: '/public/questions', body: { name: 'Test', email: 'test@example.invalid', question: 'A valid question?' } },
];

beforeEach(() => {
	process.env.TURNSTILE_SECRET_KEY = secret;
});

afterEach(() => {
	jest.restoreAllMocks();
});

afterAll(async () => {
	if (originalSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
	else process.env.TURNSTILE_SECRET_KEY = originalSecret;
	await pool.end();
});

describe.each(endpoints)('Turnstile on $path', ({ path, body }) => {
	it.each([undefined, '', '  ', 123, {}, 'x'.repeat(2049)])(
		'rejects missing or invalid token %p before verification or database access',
		async (turnstileToken) => {
			const post = jest.spyOn(axios, 'post');
			const query = jest.spyOn(pool, 'query');
			const res = await request(app).post(path).send({ ...body, turnstileToken });
			expect(res.status).toBe(400);
			expect(post).not.toHaveBeenCalled();
			expect(query).not.toHaveBeenCalled();
		},
	);

	it('rejects an unsuccessful verification without database access', async () => {
		const post = jest.spyOn(axios, 'post').mockResolvedValue({
			data: { success: false }, status: 200, statusText: 'OK', headers: {}, config: { url: '' },
		});
		const query = jest.spyOn(pool, 'query');
		const res = await request(app).post(path).send({ ...body, turnstileToken: token });
		expect(res.status).toBe(403);
		expect(query).not.toHaveBeenCalled();
		expect(post).toHaveBeenCalledWith(
			'https://challenges.cloudflare.com/turnstile/v0/siteverify',
			new URLSearchParams({ secret, response: token }),
			expect.objectContaining({ timeout: 5000 }),
		);
	});

	it('allows successful verification to reach form validation', async () => {
		jest.spyOn(axios, 'post').mockResolvedValue({
			data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: { url: '' },
		});
		const res = await request(app).post(path).send({ turnstileToken: token });
		expect(res.status).toBe(400);
		expect(res.body.message).not.toMatch(/Turnstile/);
	});

	it('rejects a malformed verification response', async () => {
		jest.spyOn(axios, 'post').mockResolvedValue({
			data: {}, status: 200, statusText: 'OK', headers: {}, config: { url: '' },
		});
		const query = jest.spyOn(pool, 'query');
		const res = await request(app).post(path).send({ ...body, turnstileToken: token });
		expect(res.status).toBe(403);
		expect(query).not.toHaveBeenCalled();
	});

	it('fails closed when Cloudflare is unavailable', async () => {
		jest.spyOn(axios, 'post').mockRejectedValue(new Error('network error'));
		jest.spyOn(console, 'error').mockImplementation(() => {});
		const query = jest.spyOn(pool, 'query');
		const res = await request(app).post(path).send({ ...body, turnstileToken: token });
		expect(res.status).toBe(503);
		expect(query).not.toHaveBeenCalled();
	});

	it('fails closed when the secret is missing', async () => {
		delete process.env.TURNSTILE_SECRET_KEY;
		const post = jest.spyOn(axios, 'post');
		jest.spyOn(console, 'error').mockImplementation(() => {});
		const res = await request(app).post(path).send({ ...body, turnstileToken: token });
		expect(res.status).toBe(503);
		expect(post).not.toHaveBeenCalled();
	});
});

it('creates a question after successful verification', async () => {
	jest.spyOn(axios, 'post').mockResolvedValue({
		data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: { url: '' },
	});
	const query = jest.spyOn(pool, 'query').mockResolvedValue({
		command: 'INSERT', rowCount: 1, oid: 0, fields: [],
		rows: [{ id: '1', created_at: '2026-01-01' }],
	});
	const res = await request(app).post('/public/questions').send({
		...endpoints[1].body,
		turnstileToken: token,
	});
	expect(res.status).toBe(201);
	expect(query).toHaveBeenCalledTimes(1);
});

it('logs in after successful verification', async () => {
	const originalJwtSecret = process.env.JWT_SECRET;
	process.env.JWT_SECRET = randomBytes(32).toString('hex');
	try {
		const password = randomBytes(16).toString('hex');
		const passwordHash = await bcrypt.hash(password, 4);
		jest.spyOn(axios, 'post').mockResolvedValue({
			data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: { url: '' },
		});
		jest.spyOn(pool, 'query').mockResolvedValue({
			command: 'SELECT', rowCount: 1, oid: 0, fields: [],
			rows: [{ id: 1, username: 'admin', password_hash: passwordHash, role: 'admin' }],
		});
		const res = await request(app).post('/auth/login').send({
			email: 'admin@example.invalid', password, turnstileToken: token,
		});
		expect(res.status).toBe(200);
		expect(res.headers['set-cookie']).toBeDefined();
	} finally {
		if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
		else process.env.JWT_SECRET = originalJwtSecret;
	}
});
