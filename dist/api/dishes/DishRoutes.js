"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DishController_1 = require("./DishController");
const fileUpload_1 = require("../../utils/fileUpload");
const dishRoutes = express_1.default.Router();
dishRoutes.post('/add', fileUpload_1.upload.single('image'), DishController_1.addDish)
    .get('/get/:id?', DishController_1.getDishes)
    // .put('/update/:id', updateDish)
    .delete('/delete/:id', DishController_1.deleteDish);
exports.default = dishRoutes;
