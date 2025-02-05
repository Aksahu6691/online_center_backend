"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUpload_1 = require("../../utils/fileUpload");
const authentication_1 = require("../../middleware/authentication");
const testimonial_controller_1 = require("./testimonial.controller");
const testimonialRoutes = express_1.default.Router();
testimonialRoutes.post('/add', authentication_1.protect, fileUpload_1.upload.single('image'), testimonial_controller_1.addTestimonial)
    .get('/get/:id?', testimonial_controller_1.getTestimonial)
    .delete('/delete/:id', authentication_1.protect, testimonial_controller_1.deleteTestimonial);
exports.default = testimonialRoutes;
