import { Router } from 'express';
import * as userController from '../controllers/user';
import { registerMiddleware } from '../middlewares/user';

export const router = Router();

router.post('/register', registerMiddleware, userController.createUserHandler);
router.post('/initLogin', userController.initLogin);
router.post('/login', userController.login);