"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlog = exports.updateBlog = exports.getBlogById = exports.getBlogs = exports.addBlog = void 0;
const database_config_1 = require("../../config/database.config");
const logger_1 = __importDefault(require("../../utils/logger"));
const blog_model_1 = require("./blog.model");
const fs_1 = __importDefault(require("fs"));
const environment_config_1 = __importDefault(require("../../config/environment.config"));
const blogRepository = database_config_1.AppDataSource.getRepository(blog_model_1.Blog);
// ✅ Add Blog
const addBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, author } = req.body;
        if (!title || !description || !author) {
            throw new Error("Title, description, and author are required");
        }
        let image;
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) {
            image = `images/${req.file.filename}`;
        }
        else {
            throw new Error("Image is required");
        }
        const newBlog = new blog_model_1.Blog();
        newBlog.title = title;
        newBlog.description = description;
        newBlog.author = author;
        newBlog.image = image;
        newBlog.uploadedDate = new Date();
        yield blogRepository.save(newBlog);
        res
            .status(201)
            .json({ message: "Blog created successfully", blog: newBlog });
    }
    catch (error) {
        logger_1.default.error("Error adding blog:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.addBlog = addBlog;
// ✅ Get All Blogs with Pagination
const getBlogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { page, limit } = req.query;
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        // Fetch blogs with author relation
        const [blogs, total] = yield blogRepository.findAndCount({
            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            order: { uploadedDate: "DESC" },
            relations: ["author"],
        });
        // Check if blogs are being retrieved correctly
        if (!blogs.length) {
            res.status(404).json({ error: "No blogs found" });
        }
        // Format blogs with author details
        const formattedBlogs = blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            description: blog.description,
            image: `${environment_config_1.default.app.apiUrl}/${blog.image}`,
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
        res.status(200).json({
            currentDataSize: blogs.length,
            totalDataSize: total,
            totalPages,
            currentPage: pageNumber,
            hasMore,
            blogs: formattedBlogs,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving blogs:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.getBlogs = getBlogs;
// ✅ Get Single Blog by ID
const getBlogById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const blog = yield blogRepository.findOne({ where: { id } });
        if (!blog) {
            throw new Error("Blog not found");
        }
        res.status(200).json(Object.assign(Object.assign({}, blog), { image: `${environment_config_1.default.app.apiUrl}/${blog.image}` }));
    }
    catch (error) {
        logger_1.default.error("Error retrieving blog:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.getBlogById = getBlogById;
// ✅ Update Blog
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const blog = yield blogRepository.findOne({ where: { id } });
        if (!blog) {
            throw new Error("Blog not found");
        }
        blog.title = title !== null && title !== void 0 ? title : blog.title;
        blog.description = description !== null && description !== void 0 ? description : blog.description;
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) {
            try {
                yield fs_1.default.promises.unlink(`public/${blog.image}`);
            }
            catch (error) {
                logger_1.default.error("Error deleting blog image:", error);
            }
            blog.image = `images/${req.file.filename}`;
        }
        const updatedBlog = yield blogRepository.save(blog);
        res
            .status(200)
            .json({ message: "Blog updated successfully", blog: updatedBlog });
    }
    catch (error) {
        logger_1.default.error("Error updating blog:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.updateBlog = updateBlog;
// ✅ Delete Blog
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const blog = yield blogRepository.findOne({ where: { id } });
        if (!blog) {
            throw new Error("Blog not found");
        }
        if (blog.image) {
            try {
                yield fs_1.default.promises.unlink(`public/${blog.image}`);
            }
            catch (error) {
                logger_1.default.error("Error deleting blog image:", error);
            }
        }
        yield blogRepository.remove(blog);
        res.status(200).json({ message: "Blog deleted successfully" });
    }
    catch (error) {
        logger_1.default.error("Error deleting blog:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.deleteBlog = deleteBlog;
