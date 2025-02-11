import express from "express";
import {
  addBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from "./blog.controller";
import { upload } from "../../utils/fileUpload";
import { protect } from "../../middleware/authentication";

const blogRoutes = express.Router();

blogRoutes
  .post("/add", protect, upload.single("image"), addBlog)
  .get("/get", protect, getBlogs)
  .get("/get/:id", protect, getBlogById)
  .patch("/update/:id", protect, upload.single("image"), updateBlog)
  .delete("/delete/:id", protect, deleteBlog);

export default blogRoutes;
