import { Request, Response } from 'express';

import { AdminCreateTagRequest, AdminCreateTagResponse } from '@/types/adminTypes.js';

import pool from '../../db/pool.js';

const createTag = async (
	req: Request<{}, {}, AdminCreateTagRequest>,
	res: Response<AdminCreateTagResponse>,
) => {
	try {
		const { tag } = req.body;

		if (!tag || typeof tag !== 'string' || tag.trim() === '') {
			return res.status(400).json({
				success: false,
				message: 'Tag name is required and must be a non-empty string.',
			});
		}

		const result = await pool.query(
			'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id, name',
			[tag.trim()],
		);

		if (result.rowCount === 0) {
			return res.status(409).json({
				success: false,
				message: 'Tag already exists.',
			});
		}

		return res.status(201).json({
			success: true,
			message: 'Tag is created successfully.',
			data: result.rows[0],
		});
	} catch (error) {
		console.error('Error creating tag:', error);
		return res
			.status(500)
			.json({ success: false, message: 'We’re sorry. We couldn’t create the tag.' });
	}
};

export default createTag;
