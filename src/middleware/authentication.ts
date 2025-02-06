import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database.config";
import env from "../config/environment.config";
import { Users } from "../api/user/user.model";

export const protect: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRepository = AppDataSource.getRepository(Users);

    // 1. Read the token from the authorization header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ message: "You are not authenticated!" });
      return;
    }

    // 2. Verify the token
    const decodedToken = jwt.verify(token, env.app.secreteKey as string) as {
      id: string;
      iat: number;
    };

    // 3. Check if the user exists
    const user = await userRepository.findOne({
      where: { id: decodedToken.id },
      select: ["id", "passwordUpdatedAt"],
    });

    if (!user) {
      res
        .status(404)
        .json({ message: "The user with the given token does not exist" });
      return;
    }

    // 4. Check if the user changed the password after the token was issued
    if (user.passwordUpdatedAt) {
      const passwordChangedAt = Math.floor(
        user.passwordUpdatedAt.getTime() / 1000
      );
      if (decodedToken.iat < passwordChangedAt) {
        res.status(401).json({
          message:
            "The password has been changed recently. Please log in again.",
        });
        return;
      }
    }

    // 5. Attach user to request and proceed
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
