import { Router } from 'express';
import * as userController from '../controllers/user';
export const router = Router();

router.post('/register', userController.createUserHandler);
router.post('/initLogin', userController.initLogin);
router.post('/login', userController.login);