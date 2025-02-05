import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import log from "../../utils/logger";
import { Blog } from "./blog.model";
import fs from "fs";

const blogRepository = AppDataSource.getRepository(Blog);

// ✅ Add Blog
export const addBlog = async (req: Request, res: Response) => {
  try {
    const { title, description, author } = req.body;

    if (!title || !description || !author) {
      throw new Error("Title, description, and author are required");
    }

    let image: string;
    if (req.file?.filename) {
      image = `images/${req.file.filename}`;
    } else {
      throw new Error("Image is required");
    }

    const newBlog = new Blog();
    newBlog.title = title;
    newBlog.description = description;
    newBlog.author = author;
    newBlog.image = image;
    newBlog.uploadedDate = new Date();

    await blogRepository.save(newBlog);

    res
      .status(201)
      .json({ message: "Blog created successfully", blog: newBlog });
  } catch (error: any) {
    log.error("Error adding blog:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get All Blogs with Pagination
export const getBlogs = async (req: Request, res: Response) => {
  try {
    let { page, limit } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;

    const [blogs, total] = await blogRepository.findAndCount({
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: { uploadedDate: "DESC" },
    });

    const totalPages = Math.ceil(total / pageSize);
    const hasMore = pageNumber < totalPages;

    res.status(200).json({
      currentDataSize: blogs.length,
      totalDataSize: total,
      totalPages,
      currentPage: pageNumber,
      hasMore,
      blogs,
    });
  } catch (error: any) {
    log.error("Error retrieving blogs:", error.message);
    res.status(500).json({ error: error.message });
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

    res.status(200).json(blog);
  } catch (error: any) {
    log.error("Error retrieving blog:", error.message);
    res.status(500).json({ error: error.message });
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

    res
      .status(200)
      .json({ message: "Blog updated successfully", blog: updatedBlog });
  } catch (error: any) {
    log.error("Error updating blog:", error.message);
    res.status(500).json({ error: error.message });
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

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error: any) {
    log.error("Error deleting blog:", error.message);
    res.status(500).json({ error: error.message });
  }
};
