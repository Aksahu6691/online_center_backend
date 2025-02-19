import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import log from "../../utils/logger";
import { Blog } from "./blog.model";
import fs from "fs";
import environmentConfig from "../../config/environment.config";
import { successResponse, errorResponse } from "../../utils/apiResponse";
import { Users } from "../user/user.model";

const blogRepository = AppDataSource.getRepository(Blog);
const userRepository = AppDataSource.getRepository(Users);
const blogMongoRepository = AppDataSource.getMongoRepository(Blog);

// ✅ Add Blog
export const addBlog = async (req: Request, res: Response) => {
  try {
    const { title, description, authorId } = req.body;

    if (!title || !description || !authorId) {
      throw new Error("Title, description, and authorId are required");
    }

    if (!req.file?.filename) {
      throw new Error("Image is required");
    }

    const newBlog = new Blog();
    newBlog.title = title;
    newBlog.description = description;
    newBlog.authorId = authorId;
    newBlog.image = `images/${req.file.filename}`;
    newBlog.uploadedDate = new Date();

    await blogRepository.save(newBlog);

    successResponse(res, "Blog created successfully", newBlog);
  } catch (error) {
    log.error("Error adding blog:", error);
    errorResponse(res, error);
  }
};

// ✅ Get All Blogs with Pagination
export const getBlogs = async (req: Request, res: Response) => {
  try {
    let { page, limit } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;

    // Aggregation pipeline to join blogs with authors
    const blogs = await blogMongoRepository
      .aggregate([
        {
          $lookup: {
            from: "users", // Collection name in MongoDB
            localField: "authorId",
            foreignField: "id",
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: 1,
            title: 1,
            description: 1,
            image: 1,
            uploadedDate: 1,
            "author.id": 1,
            "author.name": 1,
            "author.designation": 1,
          },
        },
        { $sort: { uploadedDate: -1 } },
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize },
      ])
      .toArray(); // Convert aggregation result to an array

    if (!blogs.length) {
      throw new Error("No blogs found");
    }

    successResponse(res, "Blogs retrieved successfully", {
      currentDataSize: blogs.length,
      totalPages: Math.ceil((await blogRepository.count()) / pageSize),
      currentPage: pageNumber,
      hasMore: pageNumber * pageSize < (await blogRepository.count()),
      blogs,
    });
  } catch (error) {
    log.error("Error retrieving blogs:", error);
    errorResponse(res, error);
  }
};

// ✅ Get Single Blog by ID
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the blog by ID
    const blog = await blogRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new Error("Blog not found");
    }

    // Find the author of the blog
    const author = await userRepository.findOne({
      where: { id: blog.authorId },
      select: ["id", "name", "designation"],
    });

    if (!author) {
      throw new Error("Author not found");
    }

    // Attach the author to the blog object
    blog.author = author;

    successResponse(res, "Blog retrieved successfully", {
      ...blog,
      image: `${environmentConfig.app.apiUrl}/${blog.image}`,
    });
  } catch (error) {
    log.error("Error retrieving blog:", error);
    errorResponse(res, error);
  }
};

// ✅ Update Blog
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const blog = await blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new Error("Blog not found");
    }

    blog.title = title ?? blog.title;
    blog.description = description ?? blog.description;

    if (req.file?.filename) {
      try {
        await fs.promises.unlink(`public/${blog.image}`);
      } catch (error) {
        log.error("Error deleting blog image:", error);
      }
      blog.image = `images/${req.file.filename}`;
    }

    const updatedBlog = await blogRepository.save(blog);

    successResponse(res, "Blog updated successfully", updatedBlog);
  } catch (error) {
    log.error("Error updating blog:", error);
    errorResponse(res, error);
  }
};

// ✅ Delete Blog
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new Error("Blog not found");
    }

    if (blog.image) {
      try {
        await fs.promises.unlink(`public/${blog.image}`);
      } catch (error) {
        log.error("Error deleting blog image:", error);
      }
    }

    await blogRepository.remove(blog);

    successResponse(res, "Blog deleted successfully");
  } catch (error) {
    log.error("Error deleting blog:", error);
    errorResponse(res, error);
  }
};
