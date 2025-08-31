// src/middleware/auth.ts
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JwtPayload } from "../types/auth";
import dotenv from "dotenv";
dotenv.config();

// import { ENV } from "../config/env";

// console.log(ENV.jwtSecret); // always a string

const jwtSecret = process.env.JWT_SECRET as string; // assert it's a string

export const verifyToken = (
    req: AuthenticatedRequest,   // ⬅️ use our custom request type
    res: Response,
    next: NextFunction
) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        req.jwt = {
            id: decoded.id,
            email: decoded.email,
            displayName: decoded.displayName,
        }; // ✅ no TS error now

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token is not valid" });
    }
};
