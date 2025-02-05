import env from '../config/environment.config';
import { Request, Response, NextFunction } from 'express';

const AUTH0_DOMAIN = env.auth.authDomain!;

// Utility to validate the access token using the /userinfo endpoint
const validateAccessToken = async (accessToken: string) => {
    try {
        const response = await fetch(`${AUTH0_DOMAIN}/userinfo`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to validate access token");
        }

        const userInfo = await response.json();
        return userInfo;
    } catch (error: any) {
        console.error("Error validating access token:", error.message);
        throw new Error("Invalid access token");
    }
};

// Middleware to check authentication
const checkAuth_old = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Read the token from the authorization header
        const authHeader = req.headers.authorization;
        let token: string | undefined;

        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            throw new Error("You are not authenticated!");
        }

        const userInfo = await validateAccessToken(token);

        // Attach user info to the request object for further use
        (req as any).user = userInfo;

        next();
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};

export default checkAuth_old;