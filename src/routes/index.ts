import { Router } from 'express';

const router = Router();

// временный пустой маршрут-заглушка
router.get('/', (req, res) => {
	res.send('API placeholder route');
});

export default router;
