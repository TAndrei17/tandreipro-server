import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';

import router from './routes/index.js';

const app: Express = express();

const corsOptions = {
	origin: process.env.NODE_ENV === 'production' ? 'https://tandrei.pro' : 'http://localhost:5173',
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use('/', router);

export default app;
