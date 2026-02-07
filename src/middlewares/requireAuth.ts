import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
	userId: number;
	role: string;
}

// The middleware validates the token before the request reaches the server.
// If the token is expired or invalid, authorization fails
// and the request will not be processed.

export function requireAuth(requiredRole: 'admin' | 'user' = 'admin') {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Extract the token from the request
			const token = req.cookies?.auth_token;

			if (!token) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			// Verify the token (under the hood)
			const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

			// Check the role - admin
			if (requiredRole && decoded.role !== requiredRole) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			// Pass the user data forward
			req.user = {
				id: decoded.userId,
				role: decoded.role,
			};

			next();
		} catch (err) {
			console.log(err);
			return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
		}
	};
}
