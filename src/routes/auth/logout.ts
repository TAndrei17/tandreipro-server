import { Router } from 'express';

import logoutAdmin from '../../services/auth/logoutAdmin.js';
import routes from '../routes.js';

const logout = Router();

logout.post(
	routes.authLogout, // '/auth/logout'
	logoutAdmin,
);

export default logout;
