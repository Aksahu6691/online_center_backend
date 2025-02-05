import express from "express";
import {
  addTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "./testimonial.controller";

const testimonialRoutes = express.Router();

testimonialRoutes
  .get("/get/:id?", getTestimonials)
  .post("/add", addTestimonial)
  .patch("/update/:id", updateTestimonial)
  .delete("/delete/:id", deleteTestimonial);

export default testimonialRoutes;
