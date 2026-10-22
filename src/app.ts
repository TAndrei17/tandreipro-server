import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';

import router from './routes/index.js';

const app: Express = express();

const allowedProdOrigins = ['https://tandrei.pro', 'https://www.tandrei.pro'];

const allowedDevOrigins = ['https://dev.tandreipro-page.pages.dev', 'http://localhost:5173'];

const corsOptions = {
	origin: process.env.NODE_ENV === 'production' ? allowedProdOrigins : allowedDevOrigins,
	credentials: true,
	optionsSuccessStatus: 200,
};

// Behind a reverse proxy, set TRUST_PROXY (e.g. 1) so rate limits use the real client IP
if (process.env.TRUST_PROXY) {
	const hops = Number(process.env.TRUST_PROXY);
	app.set('trust proxy', Number.isInteger(hops) ? hops : process.env.TRUST_PROXY);
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

app.use('/', router);

export default app;
