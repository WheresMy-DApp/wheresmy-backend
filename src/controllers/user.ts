import { NextFunction, Request, RequestHandler, Response } from "express";

import { AuthenticatedRequest } from "../middlewares/user";
import User from "../models/user";
import { UnauthorizedError } from "../utils/errors";

export async function initLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await User.findUser(req.body.walletAddress);
        if (!user) {
            const user = User.parse(req.body);
            await user.save();
            const findUser = await User.findUser(req.body.walletAddress);
            const message = await findUser!.generateSigningMessage();
            res.status(200).send({
                message: message
            });
        } else {
            const message = await user.generateSigningMessage();
            res.status(200).send({
                message: message
            });
        }
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await User.findUser(req.body.walletAddress);
        if (user) {
            const isValidUser = await user.validateSignature(req.body.signature);
            if (isValidUser) {
                const token = await user.generateToken();
                await user.updateNonce();
                res.status(200).send({
                    token: token,
                    user: isValidUser
                });
            } else {
                throw new UnauthorizedError("Invalid signature");
            }
        } else {
            throw new UnauthorizedError("User not found");
        }
    } catch (error) {
        next(error);
    }
}