import { Request, Response } from "express";
import { AppDataSource } from "../../config/database.config";
import log from "../../utils/logger";
import { Services } from "./service.model";
import fs from "fs";
import environmentConfig from "../../config/environment.config";

const serviceRepository = AppDataSource.getRepository(Services);

// **Add a new service**
export const addService = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    let image = "";
    if (req.file) {
      image = `images/${req.file.filename}`;
    } else {
      throw new Error("Image is required");
    }

    if (!title || !description) {
      throw new Error("Title and description are required");
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
    newService.image = image;

    await serviceRepository.save(newService);

    res
      .status(201)
      .json({ message: "Service created successfully", service: newService });
  } catch (error: any) {
    log.error("Error adding service:", error.message);
    res.status(500).json({ error: error.message });
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
      console.log("service", service);
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

    res.status(200).json({
      data: service,
      currentDataSize,
      totalDataSize,
      totalPages,
      currentPage: page,
      hasMore,
    });
  } catch (error: any) {
    log.error("Error retrieving service:", error.message);
    res.status(500).json({ error: error.message });
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

    if (req.file) {
      try {
        await fs.promises.unlink(`public/${service.image}`);
      } catch (error) {
        log.error("Error deleting service image:", error);
      }
      service.image = `images/${req.file.filename}`;
    }

    const updatedService = await serviceRepository.save(service);

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error: any) {
    log.error("Error updating service:", error.message);
    res.status(500).json({ error: error.message });
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

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error: any) {
    log.error("Error deleting service:", error.message);
    res.status(500).json({ error: error.message });
  }
};
