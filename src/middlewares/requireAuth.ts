import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
	userId: number;
	role: string;
}

/*

In the middleware, I’m effectively extending the `Req` object with new data. 
TypeScript doesn’t recognize this data, so the server build fails. 
I had to create a new generic `AuthenticatedRequest` that extends `Req`. 
This way, in subsequent components, I can use `AuthenticatedRequest` 
and safely access the data added by the middleware.

*/

export interface AuthenticatedRequest<
	P = Record<string, any>,
	ResBody = any,
	ReqBody = any,
	ReqQuery = Record<string, any>,
	LocalsObj extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, LocalsObj> {
	user?: {
		id: number;
		role: string;
	};
}

export function requireAuth(requiredRole: 'admin' | 'user' = 'admin') {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = (req as any).cookies?.auth_token;

			if (!token) {
				return res.status(401).json({ error: 'You are not authorized. Please log in.' });
			}

			const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

			if (requiredRole && decoded.role !== requiredRole) {
				return res
					.status(403)
					.json({ error: 'You do not have permission to access this resource.' });
			}

			// Here we "more or less safely" assign the type
			(req as AuthenticatedRequest).user = {
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
