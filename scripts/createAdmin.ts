import 'dotenv/config';
import bcrypt from 'bcrypt';

import pool from '../src/db/pool.js';

// Script to create an admin user in the database if it doesn't already exist
// Runs before the server starts

// command for PROD "npm run start:prod"
// command for DEV "npm run dev"

const createAdmin = async () => {
	const username = process.env.ADMIN_NAME;
	const email = process.env.ADMIN_EMAIL;
	const password = process.env.ADMIN_PASSWORD;

	if (!username || !email || !password) {
		throw new Error('Admin env variables are not set');
	}

	const hash = await bcrypt.hash(password, 10);

	const result = await pool.query(
		`INSERT INTO users (username, email, password_hash, role)
		 VALUES ($1, $2, $3, 'admin')
		 ON CONFLICT (email) DO NOTHING
		 RETURNING id, username, email, role`,
		[username, email, hash],
	);

	if (result.rowCount === 0) {
		console.log('Admin already exists, skipping');
	} else {
		console.log('Admin created:', result.rows[0]);
	}

	process.exit(0);
};

createAdmin().catch((err) => {
	console.error(err);
	process.exit(1);
});
