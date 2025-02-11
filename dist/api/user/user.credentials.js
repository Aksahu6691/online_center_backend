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
exports.VerifyLogin = exports.userLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_config_1 = require("../../config/database.config");
const user_model_1 = require("./user.model");
const environment_config_1 = __importDefault(require("../../config/environment.config"));
const userRepository = database_config_1.AppDataSource.getRepository(user_model_1.Users);
const userLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // 1. Check if email and password are provided
        if (!email || !password) {
            res
                .status(400)
                .json({ message: "Please provide both email and password" });
            return;
        }
        // 2. Check if user exists
        const user = yield userRepository.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        // 3. Check if the provided password is correct
        const isPasswordCorrect = yield user.comparePassword(password);
        if (!isPasswordCorrect) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        // 4. Check if the user is active
        if (!user.status) {
            res.status(401).json({ message: "User is not active" });
            return;
        }
        // 5. Generate a JWT token
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRETE_KEY, {
            expiresIn: "7d",
        });
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRETE_KEY, {
            expiresIn: "1d",
        });
        // 6. Return success response with the token
        res.status(200).json({
            message: "Login successful",
            refreshToken,
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                photo: `${environment_config_1.default.app.apiUrl}/${user.photo}`,
                role: user.role,
                designation: user.designation,
                status: user.status,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.userLogin = userLogin;
const VerifyLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Read the token from the body
        const token = req.body.refreshToken;
        if (!token) {
            res.status(401).json({ message: "You are not authenticated!" });
            return;
        }
        // 2. Verify the token
        const decodedToken = jsonwebtoken_1.default.verify(token, environment_config_1.default.app.secreteKey);
        // 3. Check if the user exists
        const user = yield userRepository.findOne({
            where: { id: decodedToken.id },
        });
        if (!user) {
            res
                .status(404)
                .json({ message: "The user with the given token does not exist" });
            return;
        }
        // 4. Check if the user changed the password after the token was issued
        if (user.passwordUpdatedAt) {
            const passwordChangedAt = Math.floor(user.passwordUpdatedAt.getTime() / 1000);
            if (decodedToken.iat < passwordChangedAt) {
                res.status(401).json({
                    message: "The password has been changed recently. Please log in again.",
                });
                return;
            }
        }
        // 5. Generate a JWT token
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRETE_KEY, {
            expiresIn: "7d",
        });
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.SECRETE_KEY, {
            expiresIn: "1d",
        });
        // 6. Return verified user with the token
        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                photo: `${environment_config_1.default.app.apiUrl}/${user.photo}`,
                role: user.role,
                designation: user.designation,
                status: user.status,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.VerifyLogin = VerifyLogin;
