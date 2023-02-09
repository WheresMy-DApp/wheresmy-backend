import { Router } from 'express';

export const router = Router();

router.post('/', (req, res) => {
	res.send(req.body);
});