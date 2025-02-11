"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const fileUpload_1 = require("../../utils/fileUpload");
const authentication_1 = require("../../middleware/authentication");
const user_credentials_1 = require("./user.credentials");
const userRoutes = express_1.default.Router();
userRoutes
    .post("/add", fileUpload_1.upload.single("photo"), user_controller_1.addUser)
    .get("/get/:id?", authentication_1.protect, user_controller_1.getUser)
    .patch("/update/:id", fileUpload_1.upload.single("photo"), user_controller_1.updateUser)
    .delete("/delete/:id", user_controller_1.deleteUser)
    .post("/login", user_credentials_1.userLogin)
    .post("/verify-login", user_credentials_1.VerifyLogin);
exports.default = userRoutes;
