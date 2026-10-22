import 'dotenv/config';
import bcrypt from 'bcrypt';

import pool from '../src/db/pool.js';

const resetAdminPassword = async () => {
	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;

	if (!email || !password) {
		throw new Error('Admin email and password environment variables are required');
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const result = await pool.query(
		`UPDATE users
		 SET password_hash = $1
		 WHERE email = $2 AND role = 'admin'
		 RETURNING id`,
		[passwordHash, email],
	);

	if (result.rowCount !== 1) {
		throw new Error('Admin account was not found; password was not changed');
	}

	console.log('Admin password updated');
};

try {
	await resetAdminPassword();
} catch (error) {
	console.error(error);
	process.exitCode = 1;
} finally {
	await pool.end();
}
