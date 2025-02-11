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
exports.deleteTestimonial = exports.updateTestimonial = exports.getTestimonials = exports.addTestimonial = void 0;
const database_config_1 = require("../../config/database.config");
const logger_1 = __importDefault(require("../../utils/logger"));
const testimonial_model_1 = require("./testimonial.model");
const testimonialRepository = database_config_1.AppDataSource.getRepository(testimonial_model_1.Testimonials);
// Add a new testimonial
const addTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, designation, message } = req.body;
        if (!name || !designation || !message) {
            throw new Error("Name, designation, and message are required");
        }
        const newTestimonial = new testimonial_model_1.Testimonials();
        newTestimonial.name = name;
        newTestimonial.designation = designation;
        newTestimonial.message = message;
        yield testimonialRepository.save(newTestimonial);
        res.status(201).json({
            message: "Testimonial added successfully",
            testimonial: newTestimonial,
        });
    }
    catch (error) {
        logger_1.default.error("Error adding testimonial:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.addTestimonial = addTestimonial;
// Get testimonials (all or single)
const getTestimonials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let testimonial;
        let currentDataSize = 0;
        let totalDataSize = 0;
        let totalPages = 0;
        let hasMore = false;
        if (id) {
            testimonial = yield testimonialRepository.findOne({ where: { id } });
            if (!testimonial) {
                throw new Error("Testimonial not found");
            }
            currentDataSize = 1;
            totalDataSize = 1;
            totalPages = 1;
        }
        else {
            [testimonial, totalDataSize] = yield testimonialRepository.findAndCount({
                skip,
                take: limit,
            });
            currentDataSize = testimonial.length;
            totalPages = Math.ceil(totalDataSize / limit);
            hasMore = page < totalPages;
        }
        res.status(200).json({
            testimonials: testimonial,
            currentDataSize,
            totalDataSize,
            totalPages,
            currentPage: page,
            hasMore,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving testimonials:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.getTestimonials = getTestimonials;
// Update a testimonial
const updateTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, designation, message } = req.body;
        const testimonial = yield testimonialRepository.findOne({ where: { id } });
        if (!testimonial) {
            throw new Error("Testimonial not found");
        }
        testimonial.name = name !== null && name !== void 0 ? name : testimonial.name;
        testimonial.designation = designation !== null && designation !== void 0 ? designation : testimonial.designation;
        testimonial.message = message !== null && message !== void 0 ? message : testimonial.message;
        yield testimonialRepository.save(testimonial);
        res
            .status(200)
            .json({ message: "Testimonial updated successfully", testimonial });
    }
    catch (error) {
        logger_1.default.error("Error updating testimonial:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.updateTestimonial = updateTestimonial;
// Delete a testimonial
const deleteTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const testimonial = yield testimonialRepository.findOne({ where: { id } });
        if (!testimonial) {
            throw new Error("Testimonial not found");
        }
        yield testimonialRepository.remove(testimonial);
        res.status(200).json({ message: "Testimonial deleted successfully" });
    }
    catch (error) {
        logger_1.default.error("Error deleting testimonial:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.deleteTestimonial = deleteTestimonial;
