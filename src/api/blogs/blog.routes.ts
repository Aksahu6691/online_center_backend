import express from "express";
import {
  addBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from "./blog.controller";
import { upload } from "../../utils/fileUpload";

const blogRoutes = express.Router();

blogRoutes
  .post("/add", upload.single("image"), addBlog)
  .get("/get", getBlogs)
  .get("/get/:id", getBlogById)
  .patch("/update/:id", upload.single("image"), updateBlog)
  .delete("/delete/:id", deleteBlog);

export default blogRoutes;
