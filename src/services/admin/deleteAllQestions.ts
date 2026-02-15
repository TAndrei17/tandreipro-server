import { Request, Response } from 'express';

import { AdminQuestionDeleteResponse } from '@/types/adminPanelTypes.js';

import pool from '../../db/pool.js';

const deleteAllQuestions = async (req: Request, res: Response<AdminQuestionDeleteResponse>) => {
	try {
		await pool.query('DELETE FROM questions');

		return res.status(200).json({
			success: true,
			message: 'All questions deleted successfully.',
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: 'Server error',
		});
	}
};

export default deleteAllQuestions;
