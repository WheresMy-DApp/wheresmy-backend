import { NextFunction, Request, RequestHandler, Response } from "express";
import User from "../models/user";

export interface AuthenticatedRequest extends Request {
    userId?: string,
    file?: Express.Multer.File
}

export const auth : RequestHandler = async (req : AuthenticatedRequest, res : Response, next : NextFunction) => {
    try {
        let tokenHeader = req.headers.authorization
        if(!tokenHeader) {
            throw new Error("No token provided")
        }
        let token = tokenHeader.split(" ")[1]
        let user = await User.validateToken(token)
        req.userId = user
        next()
    } catch (err : any) {
        res.status(401).json({
            status: "error",
            error: err.message
        })
    }
}