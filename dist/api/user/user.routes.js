"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../../middleware/authentication");
const user_controller_1 = require("./user.controller");
const user_creadential_1 = require("./user.creadential");
const userRoutes = express_1.default.Router();
userRoutes
    .post('/add', user_controller_1.addUser)
    .get('/get/:id?', authentication_1.protect, user_controller_1.getUser)
    .patch('/update/id', authentication_1.protect, user_controller_1.updateUser)
    .delete('/delete/id', authentication_1.protect, user_controller_1.deleteUser)
    .post('/login', user_creadential_1.userLogin);
exports.default = userRoutes;
