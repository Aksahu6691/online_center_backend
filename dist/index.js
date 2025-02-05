"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const logger_1 = __importDefault(require("./utils/logger"));
const environment_config_1 = __importDefault(require("./config/environment.config"));
const database_config_1 = require("./config/database.config");
const app_1 = __importDefault(require("./app"));
database_config_1.AppDataSource.initialize()
    .then(() => {
    logger_1.default.info('Data Base has been initialized!');
    app_1.default.listen(environment_config_1.default.app.port, () => {
        logger_1.default.info(`Server is running on port: ${environment_config_1.default.app.port}`);
    });
})
    .catch((err) => {
    logger_1.default.error(err);
    logger_1.default.error('Error during Data Source initialization:', err === null || err === void 0 ? void 0 : err.message);
    process.exit(1);
});
