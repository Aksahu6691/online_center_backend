"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = exports.testimonialRoutes = exports.dishRoutes = void 0;
const dish_routes_1 = __importDefault(require("./dishes/dish.routes"));
exports.dishRoutes = dish_routes_1.default;
const testimonial_routes_1 = __importDefault(require("./testimonial/testimonial.routes"));
exports.testimonialRoutes = testimonial_routes_1.default;
const user_routes_1 = __importDefault(require("./user/user.routes"));
exports.userRoutes = user_routes_1.default;
