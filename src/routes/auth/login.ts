import { Router } from 'express';

import { requireAuth } from '../../middlewares/requireAuth.js';
import loginAdmin from '../../services/auth/loginAdmin.js';
import meAdmin from '../../services/auth/meAdmin.js';
import routes from '../routes.js';

const login = Router();

login.post(
	routes.authLogin, // '/auth/login'
	loginAdmin,
);

login.get(
	routes.authMe, // '/auth/me'
	requireAuth(),
	meAdmin,
);

export default login;
