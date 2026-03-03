import { Request, Response } from 'express';

import { LogoutResponse } from '../../types/authTypes.js';

const logoutAdmin = async (req: Request, res: Response<LogoutResponse>) => {
	try {
		res.clearCookie('auth_token', {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
		});

		return res.status(200).json({ success: true, message: 'The session has ended.' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ success: false, message: 'Logout failed. Please try again.' });
	}
};

export default logoutAdmin;
