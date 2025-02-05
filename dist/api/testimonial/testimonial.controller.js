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
exports.deleteTestimonial = exports.getTestimonial = exports.addTestimonial = void 0;
const fs_1 = __importDefault(require("fs"));
const database_config_1 = require("../../config/database.config");
const testimonial_model_1 = require("./testimonial.model");
const testimonialRepository = database_config_1.AppDataSource.getRepository(testimonial_model_1.Testimonial);
const addTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, designation } = req.body;
        let image = "";
        if (req.file && req.file.mimetype) {
            image = `images/${req.file.filename}`;
        }
        else {
            res.status(404).json({ message: 'Image not found' });
            return;
        }
        // Create a new testimonial record using the repository
        const newTestimonial = testimonialRepository.create({
            image,
            name,
            description,
            designation
        });
        yield testimonialRepository.save(newTestimonial);
        res.status(201).json({ message: 'Data added successfully', data: newTestimonial });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding testimonial', error });
    }
});
exports.addTestimonial = addTestimonial;
const getTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const data = id
            ? yield testimonialRepository.findOneBy({ id })
            : yield testimonialRepository.find({ order: { _id: 'DESC' } });
        if (!data) {
            res.status(404).json({ message: 'Data not found' });
            return;
        }
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving testimonial', error });
    }
});
exports.getTestimonial = getTestimonial;
const deleteTestimonial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = yield testimonialRepository.findOneBy({ id });
        if (!data) {
            res.status(404).json({ message: 'Data not found' });
            return;
        }
        yield testimonialRepository.delete({ id });
        // Delete the image file from the server
        try {
            fs_1.default.unlinkSync(`public/${data.image}`);
        }
        catch (error) {
            console.log(error);
        }
        res.status(200).json({ message: 'Data deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting Data', error });
    }
});
exports.deleteTestimonial = deleteTestimonial;
