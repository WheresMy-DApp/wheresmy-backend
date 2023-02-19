import { NextFunction, Request, RequestHandler, Response } from "express";
import User from "../models/user";
import { UnauthorizedError } from "../utils/errors";

export interface AuthenticatedRequest extends Request {
    userId?: string,
    file?: Express.Multer.File
}

export default async function auth(req : AuthenticatedRequest, res : Response, next : NextFunction) {
    try {
        let tokenHeader = req.headers.authorization
        if(!tokenHeader) {
            throw new Error("No token provided")
        }
        let token = tokenHeader.split(" ")[1]
        let user = await User.validateToken(token)
        console.log(user);
        req.userId = user
        next()
    } catch (err : any) {
        res.status(401).json({
            status: "error",
            error: err.message
        })
    }
}

export const registerMiddleware : RequestHandler = async (req : Request, res : Response, next : NextFunction) => {
    try {
        let device = req.headers.device as string
        if(!device) {
            throw new UnauthorizedError("No device provided")
        }
        if(["android", "ios"].indexOf(device) === -1) {
            throw new UnauthorizedError("Invalid device provided. Register only works for android and ios devices.")
        }
        next();
    } catch (err : any) {
        res.status(401).json({
            status: "error",
            error: err.message
        })
    }
}