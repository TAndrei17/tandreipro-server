import { Response } from 'express';

import { AuthenticatedRequest } from '@/middlewares/requireAuth.js';
import { LoginResponse } from '@/types/authTypes.js';

import pool from '../../db/pool.js';

const meAdmin = async (req: AuthenticatedRequest, res: Response<LoginResponse>) => {
	try {
		// It’s important that TS recognizes the `Req` (AuthenticatedRequest) type;
		// otherwise, the server will crash.
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized.',
			});
		}

		const result = await pool.query(
			`SELECT id, username, role
			 FROM users
			 WHERE id = $1
			 LIMIT 1`,
			[userId],
		);

		if (result.rowCount === 0) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized.',
			});
		}

		const user = result.rows[0];

		return res.status(200).json({
			success: true,
			message: 'User is authenticated.',
			data: { id: user.id, name: user.username, role: user.role },
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: 'Server error.',
		});
	}
};

export default meAdmin;
