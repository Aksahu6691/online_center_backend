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
exports.deleteService = exports.updateService = exports.getService = exports.addService = void 0;
const database_config_1 = require("../../config/database.config");
const logger_1 = __importDefault(require("../../utils/logger"));
const service_model_1 = require("./service.model");
const fs_1 = __importDefault(require("fs"));
const environment_config_1 = __importDefault(require("../../config/environment.config"));
const serviceRepository = database_config_1.AppDataSource.getRepository(service_model_1.Services);
// **Add a new service**
const addService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description } = req.body;
        let image = "";
        if (req.file) {
            image = `images/${req.file.filename}`;
        }
        else {
            throw new Error("Image is required");
        }
        if (!title || !description) {
            throw new Error("Title and description are required");
        }
        // Check if service with the same title exists
        const existingService = yield serviceRepository.findOne({
            where: { title },
        });
        if (existingService) {
            throw new Error("Service with this title already exists");
        }
        const newService = new service_model_1.Services();
        newService.title = title;
        newService.description = description;
        newService.image = image;
        yield serviceRepository.save(newService);
        res
            .status(201)
            .json({ message: "Service created successfully", service: newService });
    }
    catch (error) {
        logger_1.default.error("Error adding service:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.addService = addService;
// **Get services (single or all)**
const getService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let service;
        let currentDataSize = 0;
        let totalDataSize = 0;
        let totalPages = 0;
        let hasMore = false;
        if (id) {
            service = yield serviceRepository.findOne({ where: { id } });
            if (!service) {
                throw new Error("Service not found");
            }
            service = Object.assign(Object.assign({}, service), { image: `${environment_config_1.default.app.apiUrl}/${service.image}` });
            currentDataSize = 1;
            totalDataSize = 1;
            totalPages = 1;
        }
        else {
            [service, totalDataSize] = yield serviceRepository.findAndCount({
                skip,
                take: limit,
            });
            currentDataSize = service.length;
            totalPages = Math.ceil(totalDataSize / limit);
            hasMore = page < totalPages;
            service = service.map((s) => (Object.assign(Object.assign({}, s), { image: `${environment_config_1.default.app.apiUrl}/${s.image}` })));
        }
        res.status(200).json({
            services: service,
            currentDataSize,
            totalDataSize,
            totalPages,
            currentPage: page,
            hasMore,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving service:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.getService = getService;
// **Update an existing service**
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        let service = yield serviceRepository.findOne({ where: { id } });
        if (!service) {
            throw new Error("Service not found");
        }
        service.title = title !== null && title !== void 0 ? title : service.title;
        service.description = description !== null && description !== void 0 ? description : service.description;
        if (req.file) {
            try {
                yield fs_1.default.promises.unlink(`public/${service.image}`);
            }
            catch (error) {
                logger_1.default.error("Error deleting service image:", error);
            }
            service.image = `images/${req.file.filename}`;
        }
        const updatedService = yield serviceRepository.save(service);
        res.status(200).json({
            message: "Service updated successfully",
            service: updatedService,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating service:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.updateService = updateService;
// **Delete a service**
const deleteService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const service = yield serviceRepository.findOne({ where: { id } });
        if (!service) {
            throw new Error("Service not found");
        }
        if (service.image) {
            try {
                yield fs_1.default.promises.unlink(`public/${service.image}`);
            }
            catch (error) {
                logger_1.default.error("Error deleting service image:", error);
            }
        }
        yield serviceRepository.remove(service);
        res.status(200).json({ message: "Service deleted successfully" });
    }
    catch (error) {
        logger_1.default.error("Error deleting service:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.deleteService = deleteService;
