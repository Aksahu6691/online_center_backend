import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import log from "../../utils/logger";
import { Users } from "./user.model";
import fs from "fs";
import environmentConfig from "../../config/environment.config";
import { successResponse, errorResponse } from "../../utils/apiResponse";

const userRepository = AppDataSource.getRepository(Users);

// **Add a new user**
export const addUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      mobile,
      email,
      password,
      role,
      designation,
      description,
      status,
    } = req.body;
    let photo = req.file?.mimetype ? `images/${req.file.filename}` : null;

    // Validate required fields
    if (!name || !mobile || !password) {
      throw new Error("Name, mobile, and password are required");
    }

    // Check if user already exists
    if (email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) throw new Error("User with this email already exists");
    }

    // Create & save new user
    const newUser = userRepository.create({
      name,
      mobile,
      email: email || null,
      password, // Will be hashed automatically
      photo,
      role: role || "user",
      designation,
      description: description || null,
      status: status !== undefined ? status : true,
      passwordUpdatedAt: new Date(),
    });

    await userRepository.save(newUser);
    successResponse(res, "User created successfully", newUser);
  } catch (error) {
    log.error("Error creating user:", error);
    errorResponse(res, error);
  }
};

// **Get user(s)**
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let user;
    let currentDataSize = 0;
    let totalDataSize = 0;
    let totalPages = 0;
    let hasMore = false;

    if (id) {
      user = await userRepository.findOne({ where: { id } });
      if (!user) throw new Error("User not found");

      user.photo = `${environmentConfig.app.apiUrl}/${user.photo}`;
      currentDataSize = 1;
      totalDataSize = 1;
      totalPages = 1;
    } else {
      [user, totalDataSize] = await userRepository.findAndCount({
        skip,
        take: limit,
      });

      user = user.map((u) => ({
        ...u,
        photo: `${environmentConfig.app.apiUrl}/${u.photo}`,
      }));

      currentDataSize = user.length;
      totalPages = Math.ceil(totalDataSize / limit);
      hasMore = page < totalPages;
    }

    successResponse(res, "Users retrieved successfully", {
      user,
      currentDataSize,
      totalDataSize,
      totalPages,
      currentPage: page,
      hasMore,
    });
  } catch (error) {
    log.error("Error retrieving user:", error);
    errorResponse(res, error);
  }
};

// **Update user**
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      mobile,
      email,
      role,
      designation,
      description,
      status,
      password,
    } = req.body;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) throw new Error("User not found");

    let photo = user.photo;
    if (req.file?.mimetype) {
      photo = `images/${req.file.filename}`;
      try {
        await fs.promises.unlink(`public/${user.photo}`);
      } catch (error) {
        log.error("Error deleting user photo:", error);
      }
    }

    Object.assign(user, {
      name,
      mobile,
      email,
      role,
      designation,
      description,
      status,
      password,
      photo,
    });
    await userRepository.save(user);

    successResponse(res, "User updated successfully", user);
  } catch (error) {
    log.error("Error updating user:", error);
    errorResponse(res, error);
  }
};

// **Delete user**
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOne({ where: { id } });
    if (!user) throw new Error("User not found");

    if (user.photo) {
      try {
        await fs.promises.unlink(`public/${user.photo}`);
      } catch (error) {
        log.error("Error deleting user photo:", error);
      }
    }

    await userRepository.remove(user);
    successResponse(res, "User deleted successfully");
  } catch (error) {
    log.error("Error deleting user:", error);
    errorResponse(res, error);
  }
};
