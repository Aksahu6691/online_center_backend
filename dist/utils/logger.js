"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const environment_config_1 = __importDefault(require("../config/environment.config"));
const constant_1 = require("./constant");
const log = (0, pino_1.default)({
    base: { pid: false },
    transport: {
        target: 'pino-pretty',
        options: {
            colorized: true
        },
    },
    timestamp: () => `,"time": "${new Date().toLocaleString()}"`,
    level: environment_config_1.default.environment === constant_1.appEnv.prod ? 'silent' : 'info',
});
exports.default = log;
