import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../config/database.config";
import { Users } from "./user.model";
import environmentConfig from "../../config/environment.config";

const userRepository = AppDataSource.getRepository(Users);

export const userLogin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
      res
        .status(400)
        .json({ message: "Please provide both email and password" });
      return;
    }

    // 2. Check if user exists
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // 3. Check if the provided password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // 4. Check if the user is active
    if (!user.status) {
      res.status(401).json({ message: "User is not active" });
      return;
    }

    // 5. Generate a JWT token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.SECRETE_KEY as string,
      {
        expiresIn: "7d",
      }
    );
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.SECRETE_KEY as string,
      {
        expiresIn: "1d",
      }
    );

    // 6. Return success response with the token
    res.status(200).json({
      message: "Login successful",
      refreshToken,
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: `${environmentConfig.app.apiUrl}/${user.photo}`,
        role: user.role,
        designation: user.designation,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const VerifyLogin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Read the token from the body
    const token = req.body.refreshToken;

    if (!token) {
      res.status(401).json({ message: "You are not authenticated!" });
      return;
    }

    // 2. Verify the token
    const decodedToken = jwt.verify(
      token,
      environmentConfig.app.secreteKey as string
    ) as {
      id: string;
      iat: number;
    };

    // 3. Check if the user exists
    const user = await userRepository.findOne({
      where: { id: decodedToken.id },
    });

    console.log("user", user);

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

    // 5. Generate a JWT token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.SECRETE_KEY as string,
      {
        expiresIn: "7d",
      }
    );
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.SECRETE_KEY as string,
      {
        expiresIn: "1d",
      }
    );

    // 6. Return verified user with the token
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: `${environmentConfig.app.apiUrl}/${user.photo}`,
        role: user.role,
        designation: user.designation,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
