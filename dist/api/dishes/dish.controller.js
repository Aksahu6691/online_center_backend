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
exports.deleteDish = exports.getDishes = exports.addDish = void 0;
const database_config_1 = require("../../config/database.config");
const dish_model_1 = require("./dish.model");
const logger_1 = __importDefault(require("../../utils/logger"));
const fs_1 = __importDefault(require("fs"));
const dishRepository = database_config_1.AppDataSource.getRepository(dish_model_1.Dish);
const addDish = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Add new dish");
    try {
        const { name, description } = req.body;
        let image = "";
        if (req.file && req.file.mimetype) {
            image = `images/${req.file.filename}`;
        }
        else {
            res.status(404).json({ message: 'Image not found' });
            return;
        }
        const newDish = dishRepository.create({ image, name, description });
        const savedDish = yield dishRepository.save(newDish);
        res.status(201).json({ message: 'Dish added successfully', dish: savedDish });
    }
    catch (error) {
        logger_1.default.error("Error adding dish:", error);
        res.status(500).json({ message: 'Error adding dish', error });
    }
});
exports.addDish = addDish;
const getDishes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Get all dishes...");
    try {
        const id = req.params.id;
        const dish = id ? yield dishRepository.findOneBy({ id }) : yield dishRepository.find();
        if (!dish) {
            res.status(404).json({ message: 'Dish not found' });
            return;
        }
        res.status(200).json(dish);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving dish', error });
    }
});
exports.getDishes = getDishes;
const deleteDish = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Delete dish...");
    try {
        const { id } = req.params;
        const dish = yield dishRepository.findOneBy({ id });
        if (!dish) {
            res.status(404).json({ message: 'Dish not found' });
            return;
        }
        if (dish.image) {
            const imagePath = `public/${dish.image}`;
            try {
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            catch (error) {
                console.error(`Error deleting image file: ${error}`);
            }
        }
        yield dishRepository.delete({ id });
        res.status(200).json({ message: 'Dish deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting dish:', error);
        res.status(500).json({ message: 'Error deleting dish', error });
    }
});
exports.deleteDish = deleteDish;
