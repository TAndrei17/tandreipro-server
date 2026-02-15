import { Request, Response } from 'express';

import pool from '../../db/pool.js';
import { AdminQuestionUpdateRequest, AdminQuestionUpdateResponse } from '../../types/adminTypes.js';

const updateQuestion = async (
	req: Request<{ id: string }, {}, AdminQuestionUpdateRequest>,
	res: Response<AdminQuestionUpdateResponse>,
) => {
	try {
		const id = Number(req.params.id);
		const { name, email, content, approved } = req.body;

		if (!Number.isInteger(id)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid id',
			});
		}

		// Collects only the fields that should be updated
		const fields: string[] = [];
		// Collects SQL parameter values in the correct order
		const values: (string | boolean | number)[] = [];
		let index = 1;

		if (name !== undefined) {
			fields.push(`name = $${index++}`); // $1
			values.push(name);
		}

		if (email !== undefined) {
			fields.push(`email = $${index++}`); // $2
			values.push(email);
		}

		if (content !== undefined) {
			fields.push(`content = $${index++}`); // $3
			values.push(content);
		}

		if (approved !== undefined) {
			// The index is incremented by 1 after the value is assigned
			fields.push(`approved = $${index++}`); // $4 (index = 5)
			values.push(approved);
		}

		// If there is nothing to update
		if (fields.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'No fields to update',
			});
		}

		// Always update updated_at
		fields.push('updated_at = NOW()');

		const query = `
			UPDATE questions
			SET ${fields.join(', ')}
			WHERE id = $${index}
		`;

		values.push(id);

		const result = await pool.query(query, values);

		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: 'Question not found',
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Data updated successfully',
		});
	} catch (error) {
		console.error(error);

		return res.status(500).json({
			success: false,
			message: 'Server error',
		});
	}
};

export default updateQuestion;
