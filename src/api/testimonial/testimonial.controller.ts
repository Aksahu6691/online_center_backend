import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import log from "../../utils/logger";
import { Testimonials } from "./testimonial.model";
import { successResponse, errorResponse } from "../../utils/apiResponse";

const testimonialRepository = AppDataSource.getRepository(Testimonials);

// **Add a new testimonial**
export const addTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, designation, message } = req.body;

    if (!name || !designation || !message) {
      throw new Error("Name, designation, and message are required");
    }

    const newTestimonial = new Testimonials();
    newTestimonial.name = name;
    newTestimonial.designation = designation;
    newTestimonial.message = message;

    await testimonialRepository.save(newTestimonial);

    successResponse(res, "Testimonial added successfully", newTestimonial);
  } catch (error) {
    log.error("Error adding testimonial:", error);
    errorResponse(res, error);
  }
};

// **Get testimonials (all or single)**
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let testimonial;
    let currentDataSize = 0;
    let totalDataSize = 0;
    let totalPages = 0;
    let hasMore = false;

    if (id) {
      testimonial = await testimonialRepository.findOne({ where: { id } });
      if (!testimonial) {
        throw new Error("Testimonial not found");
      }
      currentDataSize = 1;
      totalDataSize = 1;
      totalPages = 1;
    } else {
      [testimonial, totalDataSize] = await testimonialRepository.findAndCount({
        skip,
        take: limit,
      });

      currentDataSize = testimonial.length;
      totalPages = Math.ceil(totalDataSize / limit);
      hasMore = page < totalPages;
    }

    successResponse(res, "Testimonials retrieved successfully", {
      testimonials: testimonial,
      currentDataSize,
      totalDataSize,
      totalPages,
      currentPage: page,
      hasMore,
    });
  } catch (error) {
    log.error("Error retrieving testimonials:", error);
    errorResponse(res, error);
  }
};

// **Update a testimonial**
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, designation, message } = req.body;

    const testimonial = await testimonialRepository.findOne({ where: { id } });
    if (!testimonial) {
      throw new Error("Testimonial not found");
    }

    testimonial.name = name ?? testimonial.name;
    testimonial.designation = designation ?? testimonial.designation;
    testimonial.message = message ?? testimonial.message;

    await testimonialRepository.save(testimonial);

    successResponse(res, "Testimonial updated successfully", testimonial);
  } catch (error) {
    log.error("Error updating testimonial:", error);
    errorResponse(res, error);
  }
};

// **Delete a testimonial**
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testimonial = await testimonialRepository.findOne({ where: { id } });
    if (!testimonial) {
      throw new Error("Testimonial not found");
    }

    await testimonialRepository.remove(testimonial);

    successResponse(res, "Testimonial deleted successfully");
  } catch (error) {
    log.error("Error deleting testimonial:", error);
    errorResponse(res, error);
  }
};
