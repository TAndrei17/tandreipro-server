import { Router } from 'express';

import { requireAuth } from '@/middlewares/requireAuth.js';
import logoutAdmin from '@/services/auth/logoutAdmin.js';

import routes from './routes.js';

const logout = Router();

logout.post(
	routes.logout, // '/auth/logout'
	requireAuth(),
	logoutAdmin,
);

export default logout;
