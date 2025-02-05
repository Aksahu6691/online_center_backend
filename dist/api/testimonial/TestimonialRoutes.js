"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUpload_1 = require("../../utils/fileUpload");
const TestimonialController_1 = require("./TestimonialController");
const testimonialRoutes = express_1.default.Router();
testimonialRoutes.post('/add', fileUpload_1.upload.single('image'), TestimonialController_1.addTestimonial)
    .get('/get/:id?', TestimonialController_1.getTestimonial)
    .delete('/delete/:id', TestimonialController_1.deleteTestimonial);
exports.default = testimonialRoutes;
