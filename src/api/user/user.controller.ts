import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import log from "../../utils/logger";
import { Users } from "./user.model";
import fs from "fs";
import environmentConfig from "../../config/environment.config";

const userRepository = AppDataSource.getRepository(Users);

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

    let photo = null;

    if (req.file?.mimetype) {
      photo = `images/${req.file.filename}`;
    }

    // Validate required fields
    if (!name || !mobile || !password) {
      throw new Error("Name, mobile, and password are required");
    }

    // Check if the user already exists
    if (email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
    }

    // Create new user instance
    const newUser = new Users();
    newUser.name = name;
    newUser.mobile = mobile;
    newUser.email = email || null;
    newUser.password = password; // Will be hashed automatically
    newUser.photo = photo;
    newUser.role = role || "user";
    newUser.designation = designation;
    newUser.description = description || null;
    newUser.status = status !== undefined ? status : true;
    newUser.passwordUpdatedAt = new Date();

    // Save the new user
    await userRepository.save(newUser);

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error: any) {
    log.error("Error creating user:", error.message);
    res.status(500).json({ error: error.message });
  }
};

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

    // If ID is provided, fetch the specific user, else fetch all users
    if (id) {
      user = await userRepository.findOne({ where: { id } });
      if (!user) {
        throw new Error("User not found");
      }
      user = `${environmentConfig.app.apiUrl}/${user.photo}`;
      currentDataSize = 1;
      totalDataSize = 1;
      totalPages = 1;
    } else {
      [user, totalDataSize] = await userRepository.findAndCount({
        skip,
        take: limit,
      });

      user = user.map((user) => ({
        ...user,
        photo: `${environmentConfig.app.apiUrl}/${user.photo}`,
      }));

      currentDataSize = user.length;
      totalPages = Math.ceil(totalDataSize / limit);
      hasMore = page < totalPages;
    }

    res.status(200).json({
      data: user,
      currentDataSize,
      totalDataSize,
      totalPages,
      currentPage: page,
      hasMore,
    });
  } catch (error: any) {
    log.error("Error retrieving user:", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
};

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

    // Find user by ID
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }

    // Handle optional file upload (photo)
    let photo;
    if (req.file?.mimetype) {
      photo = `images/${req.file.filename}`;
      try {
        await fs.promises.unlink(`public/${user.photo}`);
      } catch (error) {
        log.error("Error deleting user photo:", error);
      }
    }

    // Update fields only if provided
    user.name = name ?? user.name;
    user.mobile = mobile ?? user.mobile;
    user.email = email ?? user.email;
    user.photo = photo ?? user.photo;
    user.role = role ?? user.role;
    user.designation = designation ?? user.designation;
    user.description = description ?? user.description;
    user.status = status !== undefined ? status : user.status;
    user.password = password ?? user.password;

    // Save updated user
    const updatedUser = await userRepository.save(user);

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error: any) {
    log.error("Error updating user:", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }

    // Remove user photo if it exists
    if (user.photo) {
      try {
        await fs.promises.unlink(`public/${user.photo}`);
      } catch (error) {
        log.error("Error deleting user photo:", error);
      }
    }

    await userRepository.remove(user); // Delete the user

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    log.error("Error deleting user:", error.message);
    res.status(error.status || 500).json({ error: error.message });
  }
};
