"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileUpload_1 = require("../../utils/fileUpload");
const authentication_1 = require("../../middleware/authentication");
const dish_controller_1 = require("./dish.controller");
const dishRoutes = express_1.default.Router();
dishRoutes.post('/add', authentication_1.protect, fileUpload_1.upload.single('image'), dish_controller_1.addDish)
    .get('/get/:id?', dish_controller_1.getDishes)
    .delete('/delete/:id', authentication_1.protect, dish_controller_1.deleteDish);
exports.default = dishRoutes;
