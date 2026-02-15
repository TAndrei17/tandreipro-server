import { Router } from 'express';

import routes from './routes.js';
import loginAdmin from '../services/auth/loginAdmin.js';

const login = Router();

login.post(
	routes.login, // '/auth/login'
	loginAdmin,
);

export default login;
