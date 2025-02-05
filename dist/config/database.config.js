"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const environment_config_1 = __importDefault(require("./environment.config"));
const constant_1 = require("../utils/constant");
const isLocal = environment_config_1.default.environment == constant_1.appEnv.local;
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mongodb",
    url: environment_config_1.default.db.url,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    logging: isLocal ? 'all' : ['error', 'warn'],
    entities: [isLocal ? 'src/**/*.model.ts' : 'build/**/*.model.js'],
    synchronize: isLocal, // Set to false in production
});
