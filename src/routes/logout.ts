import { Router } from 'express';

import { requireAuth } from '@/middlewares/requireAuth.js';
import logoutAdmin from '@/services/auth/logoutAdmin.js';

import routes from './routes.js';

const logout = Router();

logout.post(routes.logout, requireAuth(), logoutAdmin); // '/auth/logout'

export default logout;
