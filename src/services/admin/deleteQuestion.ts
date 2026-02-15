import { Request, Response } from 'express';

import pool from '../../db/pool.js';
import { AdminQuestionDeleteResponse } from '../../types/adminTypes.js';

const deleteQuestion = async (
	req: Request<{ id: string }>,
	res: Response<AdminQuestionDeleteResponse>,
) => {
	try {
		const id = Number(req.params.id);

		if (!Number.isInteger(id)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid id',
			});
		}

		const result = await pool.query('DELETE FROM questions WHERE id = $1', [id]);

		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: 'Question not found.',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Question deleted successfully.',
		});
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			success: false,
			message: 'Server error',
		});
	}
};

export default deleteQuestion;
