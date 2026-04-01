import { NextFunction, Request, Response } from "express";
import { adminAuth } from "../firebase-admin";

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid authorization header" });
    }

    const idToken = authHeader.split(" ")[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        res.status(401).json({ message: "Unauthorized" });
    }
};

// Extend express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
