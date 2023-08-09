import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { DecodedToken, ModifiedRequest } from "./types";




const authGuard = (req: ModifiedRequest, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    if (!decodedToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    console.log(decodedToken);

    req.userId = decodedToken.userId;
    req.customerId = decodedToken.customerId;

    next();
}

export default authGuard;