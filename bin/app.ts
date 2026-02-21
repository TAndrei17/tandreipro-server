#!/usr/bin/env node

// Load environment variables
import 'dotenv/config';
import app from '../src/app.js';

const requiredEnv = [
	'ADMIN_EMAIL',
	'ADMIN_NAME',
	'ADMIN_PASSWORD',
	'DATABASE_URL',
	'JWT_SECRET',
	'KEY_SECRET_CAPTCHA',
];

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);

	// Проверка переменных после запуска сервера
	const missing = requiredEnv.filter((key) => !process.env[key]);
	if (missing.length > 0) {
		console.warn(`Warning: missing environment variables: ${missing.join(', ')}`);
	}
});
