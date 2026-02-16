import { Request, Response } from 'express';

import { PublicAllTagsResponse } from '@/types/publicTypes.js';

import pool from '../../db/pool.js';
import { Tag } from '../../types/common/tag.js';

const getTags = async (req: Request, res: Response<PublicAllTagsResponse>) => {
	try {
		const result = await pool.query('SELECT id, name FROM tags ORDER BY name ASC');

		return res.status(200).json({
			success: true,
			message: 'Data loaded successfully.',
			data: result.rows as Tag[],
		});
	} catch (error) {
		console.error('Error fetching tags:', error);
		return res.status(500).json({
			success: false,
			message: 'Unable to load data.',
		});
	}
};

export default getTags;
