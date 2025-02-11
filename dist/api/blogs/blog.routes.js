"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blog_controller_1 = require("./blog.controller");
const fileUpload_1 = require("../../utils/fileUpload");
const blogRoutes = express_1.default.Router();
blogRoutes
    .post("/add", fileUpload_1.upload.single("image"), blog_controller_1.addBlog)
    .get("/get", blog_controller_1.getBlogs)
    .get("/get/:id", blog_controller_1.getBlogById)
    .patch("/update/:id", fileUpload_1.upload.single("image"), blog_controller_1.updateBlog)
    .delete("/delete/:id", blog_controller_1.deleteBlog);
exports.default = blogRoutes;
