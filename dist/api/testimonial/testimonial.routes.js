"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testimonial_controller_1 = require("./testimonial.controller");
const testimonialRoutes = express_1.default.Router();
testimonialRoutes
    .get("/get/:id?", testimonial_controller_1.getTestimonials)
    .post("/add", testimonial_controller_1.addTestimonial)
    .patch("/update/:id", testimonial_controller_1.updateTestimonial)
    .delete("/delete/:id", testimonial_controller_1.deleteTestimonial);
exports.default = testimonialRoutes;
