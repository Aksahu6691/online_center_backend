"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogRoutes = exports.testimonialRoutes = exports.serviceRoutes = exports.userRoutes = void 0;
const user_routes_1 = __importDefault(require("./user/user.routes"));
exports.userRoutes = user_routes_1.default;
const service_routes_1 = __importDefault(require("./service/service.routes"));
exports.serviceRoutes = service_routes_1.default;
const testimonial_routes_1 = __importDefault(require("./testimonial/testimonial.routes"));
exports.testimonialRoutes = testimonial_routes_1.default;
const blog_routes_1 = __importDefault(require("./blogs/blog.routes"));
exports.blogRoutes = blog_routes_1.default;
