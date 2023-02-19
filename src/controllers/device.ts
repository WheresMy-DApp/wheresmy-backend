import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/user";

import Device from "../models/device";
import { UnauthorizedError } from "../utils/errors";

import Web3Utils from "../utils/web3";
import { Web3Notification } from "../utils/web3";

export async function addDevice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        req.body.owner = req.walletAddress;
        const device = Device.parse(req.body);
        await device.save();
        res.status(200).send({
            device: device
        });
    } catch (error) {
        next(error);
    }
}

export async function getDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const devices = await Device.findByKeyValue("owner", req.walletAddress!);
        console.log(devices);
        res.status(200).send({
            devices: devices
        });
    } catch (error) {
        next(error);
    }
}

export async function foundDevicePing(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.body.deviceHash == undefined || req.body.locationCode == undefined) throw new UnauthorizedError("Invalid request");
        const devices = await Device.findByKeyValue("deviceHash", req.body.deviceHash);
        if (devices.length == 0) {
            throw new UnauthorizedError("Device not found");
        }
        const device = devices[0];
        if (device.isLost == true) {
            // send Push notification to user
            const notif = new Web3Notification(device.owner!, `Your device ${device.deviceNickname} has been found!`, `Your device ${device.deviceNickname} has been found!`, [
                {
                    "action": "OpenLost",
                    "label": "Locate",
                    "url": "wmn://device?deviceHash=" + device.deviceHash
                },
            ], "");
            Web3Utils.sendNotification(notif);
        }
        Web3Utils.foundDevicePing(device.deviceHash!, req.body.locationCode, Date.now());
        res.status(200).send({
            success: true
        });
    } catch (error) {
        next(error);
    }
}

export async function reportDeviceStatus(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.body.deviceHash == undefined || req.body.isLost == undefined) throw new UnauthorizedError("Invalid request");
        const devices = await Device.findByKeyValue("deviceHash", req.body.deviceHash);
        if (devices.length == 0) {
            throw new UnauthorizedError("Device not found");
        }
        const device = devices[0];
        device.isLost = (req.body.isLost == true);
        await device.save();
        res.status(200).send({
            success: true
        });
    } catch (error) {
        next(error);
    }
}