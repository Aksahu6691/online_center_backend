import { Request, Response, NextFunction } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import env from "../config/environment.config";

// Middleware to validate JWT
const checkJwt = auth({
    audience: env.auth.authSecreteKey,
    issuerBaseURL: env.auth.authDomain,
});

export { checkJwt };

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    // console.log("Authorization Header:", req.headers.authorization);

    checkJwt(req, res, (err) => {
        if (err) {
            console.error("Authentication Error:", err.message);
            return res.status(401).json({
                message: "Authentication failed",
                error: err.message,
            });
        }
        next();
    });
};

export default checkAuth;