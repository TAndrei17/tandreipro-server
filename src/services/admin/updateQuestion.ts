import { Response } from 'express';

import { AuthenticatedRequest } from '@/middlewares/requireAuth.js';

import pool from '../../db/pool.js';
import { AdminQuestionUpdateRequest, AdminQuestionUpdateResponse } from '../../types/adminTypes.js';

const updateQuestion = async (
	req: AuthenticatedRequest<{ id: string }, {}, AdminQuestionUpdateRequest>,
	res: Response<AdminQuestionUpdateResponse>,
) => {
	try {
		const id = Number(req.params.id);
		const { name, email, content, approved, tags } = req.body;

		if (!Number.isInteger(id)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid id.',
			});
		}

		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'Unauthorized: user data missing.',
			});
		}

		// Collects only the fields that should be updated
		const fields: string[] = [];
		// Collects SQL parameter values in the correct order
		const values: (string | boolean | number)[] = [];
		// The index is incremented by 1 after the value is assigned
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
			fields.push(`approved = $${index++}`); // $4
			values.push(approved);
		}

		// If there is nothing to update
		if (fields.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'No fields to update.',
			});
		}

		// Always update updated_at
		fields.push('updated_at = NOW()');
		// Always update admin_id
		fields.push(`admin_id = $${index++}`); // $5
		values.push(userId);

		const query = `
			UPDATE questions
			SET ${fields.join(', ')}
			WHERE id = $${index}
		`; // 'id = $6'

		values.push(id); // 'index id === 6'

		const result = await pool.query(query, values);

		if (result.rowCount === 0) {
			return res.status(404).json({
				success: false,
				message: 'Question not found.',
			});
		}

		// Link the question with tags
		if (tags && Array.isArray(tags)) {
			// 1. Remove old associations
			await pool.query('DELETE FROM question_tags WHERE question_id = $1', [id]);

			if (tags.length > 0) {
				// 2. Build VALUES and placeholders for insertion
				const values: number[] = [];
				const placeholders: string[] = [];

				tags.forEach((tagId, i) => {
					values.push(tagId);
					placeholders.push(`($1, $${i + 2})`);
				});

				await pool.query(
					`INSERT INTO question_tags (question_id, tag_id) VALUES ${placeholders.join(', ')}`,
					[id, ...values],
				);
			}
		}

		return res.status(200).json({
			success: true,
			message: 'Data updated successfully.',
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: 'Server error.',
		});
	}
};

export default updateQuestion;
