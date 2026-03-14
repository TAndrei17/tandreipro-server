import { Request, Response } from 'express';

import pool from '../../db/pool.js';
import { AdminAnswersResponse } from '../../types/adminTypes.js';

const getAllAnswers = async (req: Request, res: Response<AdminAnswersResponse>) => {
	try {
		const result = await pool.query(
			`SELECT 
                id,
                question_id,
                content,
                created_at
            FROM answers
            ORDER BY created_at DESC, id DESC`,
		);

		return res.status(200).json({
			success: true,
			message: 'Data loaded successfully.',
			data: result.rows,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, message: 'Server error' });
	}
};

export default getAllAnswers;
