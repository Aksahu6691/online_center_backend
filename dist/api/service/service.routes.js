"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_controller_1 = require("./service.controller");
const fileUpload_1 = require("../../utils/fileUpload");
const authentication_1 = require("../../middleware/authentication");
const serviceRoutes = express_1.default.Router();
serviceRoutes
    .get("/get/:id?", authentication_1.protect, service_controller_1.getService)
    .post("/add", fileUpload_1.upload.single("image"), service_controller_1.addService)
    .patch("/update/:id", fileUpload_1.upload.single("image"), service_controller_1.updateService)
    .delete("/delete/:id", service_controller_1.deleteService);
exports.default = serviceRoutes;
