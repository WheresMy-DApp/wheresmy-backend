import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/user";

import Device from "../models/device";
import { UnauthorizedError } from "../utils/errors";

export async function addDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const device = Device.parse(req.body);
        device.owner = req.userId;
        await device.save();
        res.status(201).send({
            device: device
        });
    } catch (error) {
        next(error);
    }
}

export async function getDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const devices = await Device.findByKeyValue("owner", req.userId!);
        res.status(200).send({
            devices: devices
        });
    } catch (error) {
        next(error);
    }
}

export async function getLostDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const devices = await Device.findByKeyValue("owner", req.userId!);
        const lostDevices = devices.filter((device) => device.isLost == true);
        res.status(200).send({
            devices: lostDevices
        });
    } catch (error) {
        next(error);
    }
}