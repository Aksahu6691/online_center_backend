import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import log from "../../utils/logger";
import { Services } from "./service.model";
import fs from "fs";
import environmentConfig from "../../config/environment.config";
import { successResponse, errorResponse } from "../../utils/apiResponse";

const serviceRepository = AppDataSource.getRepository(Services);

// **Add a new service**
export const addService = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new Error("Title and description are required");
    }

    if (!req.file?.filename) {
      throw new Error("Image is required");
    }

    // Check if service with the same title exists
    const existingService = await serviceRepository.findOne({
      where: { title },
    });
    if (existingService) {
      throw new Error("Service with this title already exists");
    }

    const newService = new Services();
    newService.title = title;
    newService.description = description;
    newService.image = `images/${req.file.filename}`;

    await serviceRepository.save(newService);

    successResponse(res, "Service created successfully", newService);
  } catch (error) {
    log.error("Error adding service:", error);
    errorResponse(res, error);
  }
};

// **Get services (single or all)**
export const getService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let service;
    let currentDataSize = 0;
    let totalDataSize = 0;
    let totalPages = 0;
    let hasMore = false;

    if (id) {
      service = await serviceRepository.findOne({ where: { id } });
      if (!service) {
        throw new Error("Service not found");
      }
      service = {
        ...service,
        image: `${environmentConfig.app.apiUrl}/${service.image}`,
      };
      currentDataSize = 1;
      totalDataSize = 1;
      totalPages = 1;
    } else {
      [service, totalDataSize] = await serviceRepository.findAndCount({
        skip,
        take: limit,
      });

      currentDataSize = service.length;
      totalPages = Math.ceil(totalDataSize / limit);
      hasMore = page < totalPages;

      service = service.map((s) => ({
        ...s,
        image: `${environmentConfig.app.apiUrl}/${s.image}`,
      }));
    }

    successResponse(res, "Services retrieved successfully", {
      services: service,
      currentDataSize,
      totalDataSize,
      totalPages,
      currentPage: page,
      hasMore,
    });
  } catch (error) {
    log.error("Error retrieving service:", error);
    errorResponse(res, error);
  }
};

// **Update an existing service**
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    let service = await serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new Error("Service not found");
    }

    service.title = title ?? service.title;
    service.description = description ?? service.description;

    if (req.file?.filename) {
      try {
        await fs.promises.unlink(`public/${service.image}`);
      } catch (error) {
        log.error("Error deleting service image:", error);
      }
      service.image = `images/${req.file.filename}`;
    }

    const updatedService = await serviceRepository.save(service);

    successResponse(res, "Service updated successfully", updatedService);
  } catch (error) {
    log.error("Error updating service:", error);
    errorResponse(res, error);
  }
};

// **Delete a service**
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new Error("Service not found");
    }

    if (service.image) {
      try {
        await fs.promises.unlink(`public/${service.image}`);
      } catch (error) {
        log.error("Error deleting service image:", error);
      }
    }

    await serviceRepository.remove(service);

    successResponse(res, "Service deleted successfully");
  } catch (error) {
    log.error("Error deleting service:", error);
    errorResponse(res, error);
  }
};
