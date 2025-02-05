"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUser = exports.addUser = void 0;
const database_config_1 = require("../../config/database.config");
const logger_1 = __importDefault(require("../../utils/logger"));
const user_model_1 = require("./user.model");
const userRepository = database_config_1.AppDataSource.getRepository(user_model_1.User);
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, mobile, email, password } = req.body;
        // Validate required fields
        if (!name || !mobile || !email || !password) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        // Check if the user already exists
        const existingUser = yield userRepository.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({ message: 'User with this email already exists' });
            return;
        }
        // Create new user instance
        const newUser = new user_model_1.User();
        newUser.name = name;
        newUser.mobile = mobile;
        newUser.email = email;
        newUser.password = password;
        newUser.passwordUpdatedAt = new Date();
        // Save the new user
        yield userRepository.save(newUser);
        res.status(201).json({ message: 'User created successfully', user: newUser });
    }
    catch (error) {
        logger_1.default.error("Error creating user:", error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.addUser = addUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        let user;
        // If ID is provided, fetch the specific user, else fetch all users
        if (id) {
            user = yield userRepository.findOne({ where: { id } });
        }
        else {
            user = yield userRepository.find();
        }
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        logger_1.default.error("Error retrieving user:", error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, mobile } = req.body;
        const user = yield userRepository.findOne({ where: { id } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.name = name !== null && name !== void 0 ? name : user.name;
        user.mobile = mobile !== null && mobile !== void 0 ? mobile : user.mobile;
        const updatedUser = yield userRepository.save(user);
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    }
    catch (error) {
        logger_1.default.error("Error updating user:", error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield userRepository.findOne({ where: { id } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        yield userRepository.remove(user); // Delete the user
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        logger_1.default.error("Error deleting user:", error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.deleteUser = deleteUser;
