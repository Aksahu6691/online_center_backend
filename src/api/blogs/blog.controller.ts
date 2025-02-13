import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import log from "../../utils/logger";
import { Blog } from "./blog.model";
import fs from "fs";
import environmentConfig from "../../config/environment.config";
import { successResponse, errorResponse } from "../../utils/apiResponse";

const blogRepository = AppDataSource.getRepository(Blog);

// ✅ Add Blog
export const addBlog = async (req: Request, res: Response) => {
  try {
    const { title, description, author } = req.body;

    if (!title || !description || !author) {
      throw new Error("Title, description, and author are required");
    }

    if (!req.file?.filename) {
      throw new Error("Image is required");
    }

    const newBlog = new Blog();
    newBlog.title = title;
    newBlog.description = description;
    newBlog.author = author;
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

    // Fetch blogs with author relation
    const [blogs, total] = await blogRepository.findAndCount({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: { uploadedDate: "DESC" },
      relations: ["author"],
    });

    if (!blogs.length) {
      throw new Error("No blogs found");
    }

    const formattedBlogs = blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      description: blog.description,
      image: `${environmentConfig.app.apiUrl}/${blog.image}`,
      uploadedDate: blog.uploadedDate,
      author: blog.author
        ? {
            id: blog.author.id,
            name: blog.author.name,
            designation: blog.author.designation,
          }
        : null,
    }));

    const totalPages = Math.ceil(total / pageSize);
    const hasMore = pageNumber < totalPages;

    successResponse(res, "Blogs retrieved successfully", {
      currentDataSize: blogs.length,
      totalDataSize: total,
      totalPages,
      currentPage: pageNumber,
      hasMore,
      blogs: formattedBlogs,
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

    const blog = await blogRepository.findOne({ where: { id } });
    if (!blog) {
      throw new Error("Blog not found");
    }

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
