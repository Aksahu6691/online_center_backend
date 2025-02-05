"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = require("./api");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
// app.use(cors());
app.use((0, express_1.json)());
app.use((0, express_1.urlencoded)({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public'))); // enable static folder
app.use('/api/dish', api_1.dishRoutes);
app.use('/api/testimonial', api_1.testimonialRoutes);
app.use('/api/user', api_1.userRoutes);
// If not found api then give message
app.all('*', (req, res, next) => {
    next(`Can't find ${req.originalUrl} on the server`);
});
// Error Handle
process.on("uncaughtException", (err) => {
    console.error(err.name, err.message);
    console.error("Uncaught Exception occurred! Shutting down...");
    process.exit(1);
});
exports.default = app;
