import bcrypt from 'bcrypt';
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import pool from '@/db/pool.js'; // check it

import routes from './routes.js';

const login = Router();

login.post(routes.login, async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ error: 'Unable to log in. Please verify your email and password.' });
		}

		// 1. Get admin by email
		const result = await pool.query(
			`SELECT id, username, password_hash, role
			 FROM users
			 WHERE email = $1 AND role = 'admin'
			 LIMIT 1`,
			[email],
		);

		if (result.rowCount === 0) {
			return res
				.status(401)
				.json({ error: 'Unable to log in. Please verify your email and password.' });
		}

		const user = result.rows[0];

		// 2. Compare password
		const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
		if (!isPasswordMatch) {
			return res
				.status(401)
				.json({ error: 'Unable to log in. Please verify your email and password.' });
		}

		// 3. Generate JWT
		const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
			expiresIn: '60m',
		});

		// 4. Send token via httpOnly cookie
		res.cookie('auth_token', token, {
			httpOnly: true, // cannot be read from client-side JavaScript
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict', // protection from CSRF
			maxAge: 60 * 60 * 1000, // 60 minutes
		});

		return res.status(200).json({ success: true, role: user.role });
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ error: 'Unable to log in. Please verify your email and password.' });
	}
});

export default login;
