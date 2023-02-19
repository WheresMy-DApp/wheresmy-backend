import { Router } from 'express';
import * as deviceController from '../controllers/device';

import userAuth from '../middlewares/user';
export const router = Router();

router.post('/', userAuth, deviceController.addDevice);
router.get('/', userAuth, deviceController.getDevices);
router.post('/reportDevice', userAuth, deviceController.reportDeviceStatus);
router.post('/foundPing', deviceController.foundDevicePing);