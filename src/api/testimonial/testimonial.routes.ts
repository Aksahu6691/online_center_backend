import express from "express";
import {
  addTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "./testimonial.controller";
import { protect } from "../../middleware/authentication";

const testimonialRoutes = express.Router();

testimonialRoutes
  .get("/get/:id?", protect, getTestimonials)
  .post("/add", protect, addTestimonial)
  .patch("/update/:id", protect, updateTestimonial)
  .delete("/delete/:id", protect, deleteTestimonial);

export default testimonialRoutes;
