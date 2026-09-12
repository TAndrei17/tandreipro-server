import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';

import router from './routes/index.js';

const app: Express = express();

const allowedProdOrigins = ['https://tandrei.pro', 'https://www.tandrei.pro'];

const allowedDevOrigins = ['https://dev.tandreipro-page.pages.dev', 'http://localhost:5173'];

const corsOptions = {
	origin: process.env.NODE_ENV === 'production' ? allowedProdOrigins : allowedDevOrigins,
	credentials: true,
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use('/', router);

export default app;
