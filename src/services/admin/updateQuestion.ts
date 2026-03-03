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

		const fields: string[] = [];
		const values: (string | boolean | number)[] = [];
		let index = 1;

		if (name !== undefined) {
			fields.push(`name = $${index++}`);
			values.push(name);
		}

		if (email !== undefined) {
			fields.push(`email = $${index++}`);
			values.push(email);
		}

		if (content !== undefined) {
			fields.push(`content = $${index++}`);
			values.push(content);
		}

		if (approved !== undefined) {
			fields.push(`approved = $${index++}`);
			values.push(approved);
		}

		const hasQuestionFields = fields.length > 0;
		const hasTags = Array.isArray(tags);

		if (!hasQuestionFields && !hasTags) {
			return res.status(400).json({
				success: false,
				message: 'No fields to update.',
			});
		}

		await pool.query('BEGIN');

		// Update question table only if needed
		if (hasQuestionFields) {
			fields.push('updated_at = NOW()');
			fields.push(`admin_id = $${index++}`);
			values.push(userId);

			const query = `
				UPDATE questions
				SET ${fields.join(', ')}
				WHERE id = $${index}
			`;

			values.push(id);

			const result = await pool.query(query, values);

			if (result.rowCount === 0) {
				await pool.query('ROLLBACK');
				return res.status(404).json({
					success: false,
					message: 'Question not found.',
				});
			}
		}

		// Update tags if provided
		if (hasTags) {
			await pool.query('DELETE FROM question_tags WHERE question_id = $1', [id]);

			if (tags.length > 0) {
				const tagValues: number[] = [];
				const placeholders: string[] = [];

				tags.forEach((tagId, i) => {
					tagValues.push(tagId);
					placeholders.push(`($1, $${i + 2})`);
				});

				await pool.query(
					`INSERT INTO question_tags (question_id, tag_id)
					 VALUES ${placeholders.join(', ')}`,
					[id, ...tagValues],
				);
			}
		}

		await pool.query('COMMIT');

		return res.status(200).json({
			success: true,
			message: 'Data updated successfully.',
		});
	} catch (error) {
		await pool.query('ROLLBACK');
		console.error(error);

		return res.status(500).json({
			success: false,
			message: 'Server error.',
		});
	}
};

export default updateQuestion;
