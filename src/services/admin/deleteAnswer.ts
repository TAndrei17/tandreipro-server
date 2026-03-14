import { Request, Response } from 'express';

import { AdminAnswerDeleteResponse } from '@/types/adminTypes.js';

import pool from '../../db/pool.js';

const deleteAnswer = async (
	req: Request<{ id: string }>,
	res: Response<AdminAnswerDeleteResponse>,
) => {
	try {
		const id = Number(req.params.id);

		if (!Number.isInteger(id)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid id',
			});
		}

		const result = await pool.query('DELETE FROM answers WHERE id = $1', [id]);

		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: 'Answer not found.',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Answer deleted successfully.',
		});
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			success: false,
			message: 'Server error',
		});
	}
};

export default deleteAnswer;
