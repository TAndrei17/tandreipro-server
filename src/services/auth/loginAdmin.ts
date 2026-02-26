import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import pool from '../../db/pool.js';
import { LoginRequest, LoginResponse } from '../../types/authTypes.js';
import { verifyCaptcha } from '../../utils/verifyCaptcha.js';

const loginAdmin = async (req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) => {
	try {
		const { email, password, captchaToken } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Unable to log in. Please verify your email and password.',
			});
		}

		if (!captchaToken) {
			return res.status(400).json({ success: false, message: 'CAPTCHA token is missing' });
		}

		const ENV_PROD = process.env.NODE_ENV === 'production';
		const secret = ENV_PROD ? process.env.KEY_SECRET_CAPTCHA : process.env.KEY_SECRET_CAPTCHA_DEV;
		if (!secret) {
			throw new Error('CAPTCHA secret key is not set in env variables');
		}

		// CAPTCHA checking
		const captchaData = await verifyCaptcha(captchaToken);

		if (!captchaData.success) {
			return res.status(403).json({ success: false, message: 'CAPTCHA verification failed.' });
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
			return res.status(401).json({
				success: false,
				message: 'Unable to log in. Please verify your email and password.',
			});
		}

		const user = result.rows[0];

		// 2. Compare password
		const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
		if (!isPasswordMatch) {
			return res.status(401).json({
				success: false,
				message: 'Unable to log in. Please verify your email and password.',
			});
		}

		// 3. Generate JWT
		const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
			expiresIn: '60m',
		});

		// 4. Send token via httpOnly cookie
		res.cookie('auth_token', token, {
			httpOnly: true,
			sameSite: 'none', // обязательно для кросс-домена
			secure: true, // сервер HTTPS → cookie пойдёт
			maxAge: 60 * 60 * 1000,
		});

		return res.status(200).json({
			success: true,
			message: 'The admin has successfully logged in.',
			data: { id: user.id, name: user.username, role: user.role },
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: 'Unable to log in. Please verify your email and password.',
		});
	}
};

export default loginAdmin;
