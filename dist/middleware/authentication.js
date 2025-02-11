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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_config_1 = require("../config/database.config");
const environment_config_1 = __importDefault(require("../config/environment.config"));
const user_model_1 = require("../api/user/user.model");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = database_config_1.AppDataSource.getRepository(user_model_1.Users);
        // 1. Read the token from the authorization header
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];
        }
        if (!token) {
            res.status(401).json({ message: "You are not authenticated!" });
            return;
        }
        // 2. Verify the token
        const decodedToken = jsonwebtoken_1.default.verify(token, environment_config_1.default.app.secreteKey);
        // 3. Check if the user exists
        const user = yield userRepository.findOne({
            where: { id: decodedToken.id },
            select: ["id", "passwordUpdatedAt"],
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
        // 5. Attach user to request and proceed
        req.user = user;
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.protect = protect;
