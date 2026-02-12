import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel, { type IUser } from "../models/userModel.js";

interface ExtendRequest extends Request {
    user?: IUser | null;
}

 export const validateJWT = (req: ExtendRequest, res: Response, next: NextFunction) => {
    const authorizationHeader = req.get('authorization');

    if(!authorizationHeader){
        res.status(403).send("Authorization header was not provided");
        return;
    }
    const token = authorizationHeader.split(" ")[1];

    if(!token){
        res.status(403).send("Bearer token not found");
        return;
    }

    jwt.verify(token, "kcQOgjuIRjsHOlrWCxmzwX0yTXoW2bgt", async (err, payload) => {
        if(err){
            res.status(403).send("Invalid token");
            return;
        }

        const userPayload = payload as {
            email: string; 
            firstName: string; 
            lastName: string
        }
        if(!payload){
            res.send(403).send("Invalid token payload");
        }

        const user = await userModel.findOne({email: userPayload.email});

        req.user = user;
        next(); 
    });
 };

