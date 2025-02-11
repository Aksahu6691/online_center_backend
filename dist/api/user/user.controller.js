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
const fs_1 = __importDefault(require("fs"));
const environment_config_1 = __importDefault(require("../../config/environment.config"));
const userRepository = database_config_1.AppDataSource.getRepository(user_model_1.Users);
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, mobile, email, password, role, designation, description, status, } = req.body;
        let photo = null;
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.mimetype) {
            photo = `images/${req.file.filename}`;
        }
        // Validate required fields
        if (!name || !mobile || !password) {
            throw new Error("Name, mobile, and password are required");
        }
        // Check if the user already exists
        if (email) {
            const existingUser = yield userRepository.findOne({ where: { email } });
            if (existingUser) {
                throw new Error("User with this email already exists");
            }
        }
        // Create new user instance
        const newUser = new user_model_1.Users();
        newUser.name = name;
        newUser.mobile = mobile;
        newUser.email = email || null;
        newUser.password = password; // Will be hashed automatically
        newUser.photo = photo;
        newUser.role = role || "user";
        newUser.designation = designation;
        newUser.description = description || null;
        newUser.status = status !== undefined ? status : true;
        newUser.passwordUpdatedAt = new Date();
        // Save the new user
        yield userRepository.save(newUser);
        res
            .status(201)
            .json({ message: "User created successfully", user: newUser });
    }
    catch (error) {
        logger_1.default.error("Error creating user:", error.message);
        res.status(500).json({ error: error.message });
    }
});
exports.addUser = addUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        let user;
        let currentDataSize = 0;
        let totalDataSize = 0;
        let totalPages = 0;
        let hasMore = false;
        // If ID is provided, fetch the specific user, else fetch all users
        if (id) {
            user = yield userRepository.findOne({ where: { id } });
            if (!user) {
                throw new Error("User not found");
            }
            user = `${environment_config_1.default.app.apiUrl}/${user.photo}`;
            currentDataSize = 1;
            totalDataSize = 1;
            totalPages = 1;
        }
        else {
            [user, totalDataSize] = yield userRepository.findAndCount({
                skip,
                take: limit,
            });
            user = user.map((user) => (Object.assign(Object.assign({}, user), { photo: `${environment_config_1.default.app.apiUrl}/${user.photo}` })));
            currentDataSize = user.length;
            totalPages = Math.ceil(totalDataSize / limit);
            hasMore = page < totalPages;
        }
        res.status(200).json({
            data: user,
            currentDataSize,
            totalDataSize,
            totalPages,
            currentPage: page,
            hasMore,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving user:", error.message);
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { name, mobile, email, role, designation, description, status, password, } = req.body;
        // Find user by ID
        const user = yield userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error("User not found");
        }
        // Handle optional file upload (photo)
        let photo;
        if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.mimetype) {
            photo = `images/${req.file.filename}`;
            try {
                yield fs_1.default.promises.unlink(`public/${user.photo}`);
            }
            catch (error) {
                logger_1.default.error("Error deleting user photo:", error);
            }
        }
        // Update fields only if provided
        user.name = name !== null && name !== void 0 ? name : user.name;
        user.mobile = mobile !== null && mobile !== void 0 ? mobile : user.mobile;
        user.email = email !== null && email !== void 0 ? email : user.email;
        user.photo = photo !== null && photo !== void 0 ? photo : user.photo;
        user.role = role !== null && role !== void 0 ? role : user.role;
        user.designation = designation !== null && designation !== void 0 ? designation : user.designation;
        user.description = description !== null && description !== void 0 ? description : user.description;
        user.status = status !== undefined ? status : user.status;
        user.password = password !== null && password !== void 0 ? password : user.password;
        // Save updated user
        const updatedUser = yield userRepository.save(user);
        res
            .status(200)
            .json({ message: "User updated successfully", user: updatedUser });
    }
    catch (error) {
        logger_1.default.error("Error updating user:", error.message);
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield userRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error("User not found");
        }
        // Remove user photo if it exists
        if (user.photo) {
            try {
                yield fs_1.default.promises.unlink(`public/${user.photo}`);
            }
            catch (error) {
                logger_1.default.error("Error deleting user photo:", error);
            }
        }
        yield userRepository.remove(user); // Delete the user
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        logger_1.default.error("Error deleting user:", error.message);
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.deleteUser = deleteUser;
