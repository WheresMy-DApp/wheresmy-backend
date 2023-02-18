import { Router } from 'express';
import * as deviceController from '../controllers/device';
export const router = Router();

router.post('/', deviceController.addDevice);
router.get('/', deviceController.getDevices);
router.post('/reportDevice', deviceController.reportDeviceStatus);
router.post('/foundPing', deviceController.foundDevicePing);