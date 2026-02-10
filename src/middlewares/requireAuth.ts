import jwt from 'jsonwebtoken';

interface JwtPayload {
	userId: number;
	role: string;
}

// The middleware validates the token before the request reaches the server.
// If the token is expired or invalid, authorization fails
// and the request will not be processed.

/*
  Server crashed at startup with Express 5 + TypeScript + ESM because strict
  Request typing combined with jwt.verify caused a runtime exception during
  route registration.  

  Using `any` for req, res, next bypasses the type checks, allowing the
  middleware to run safely at request time without breaking the server.
*/

export function requireAuth(requiredRole: 'admin' | 'user' = 'admin') {
	return (req: any, res: any, next: any) => {
		try {
			// Extract the token from the request
			const token = req.cookies?.auth_token;

			if (!token) {
				return res.status(401).json({ error: 'You are not authorized. Please log in.' });
			}

			// Verify the token (under the hood)
			const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

			// Check the role - admin
			if (requiredRole && decoded.role !== requiredRole) {
				return res
					.status(403)
					.json({ error: 'You do not have permission to access this resource.' });
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
