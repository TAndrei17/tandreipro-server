import { Router } from 'express';

import loginAdmin from '../../services/auth/loginAdmin.js';
import routes from '../routes.js';

const login = Router();

login.post(
	routes.authLogin, // '/auth/login'
	loginAdmin,
);

export default login;
