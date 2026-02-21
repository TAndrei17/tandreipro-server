#!/usr/bin/env node

// Load environment variables
import 'dotenv/config';
import app from '../src/app.js';

// Check required environment variables
const requiredEnv = [
	'ADMIN_EMAIL',
	'ADMIN_NAME',
	'ADMIN_PASSWORD',
	'DATABASE_URL',
	'JWT_SECRET',
	'KEY_SECRET_CAPTCHA',
	'KEY_SECRET_CAPTCHA_DEV',
];
requiredEnv.forEach((key) => {
	if (!process.env[key]) {
		throw new Error(`Environment variable ${key} is not set`);
	}
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
