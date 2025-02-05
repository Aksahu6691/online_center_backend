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
const DishModel_1 = __importDefault(require("./DishModel"));
const fs_1 = __importDefault(require("fs"));
const addDish = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const newDish = new DishModel_1.default({ image, name, description });
        yield newDish.save();
        res.status(201).json({ message: 'Dish added successfully', dish: newDish });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding dish', error });
    }
});
exports.addDish = addDish;
const getDishes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const dish = id ? yield DishModel_1.default.findById(id) : yield DishModel_1.default.find().sort({ _id: -1 });
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
// export const updateDish = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { id } = req.params;
//         const { image, name, description } = req.body;
//         const updatedDish = await DishModel.findByIdAndUpdate(
//             id,
//             { image, name, description },
//             { new: true, runValidators: true }
//         );
//         if (!updatedDish) {
//             res.status(404).json({ message: 'Dish not found' });
//             return;
//         }
//         res.status(200).json({ message: 'Dish updated successfully', dish: updatedDish });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating dish', error });
//     }
// };
const deleteDish = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedDish = yield DishModel_1.default.findByIdAndDelete(id);
        if (!deletedDish) {
            res.status(404).json({ message: 'Dish not found' });
            return;
        }
        try {
            fs_1.default.unlinkSync(`public/${deletedDish.image}`);
        }
        catch (error) {
            console.log(error);
        }
        res.status(200).json({ message: 'Dish deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting dish', error });
    }
});
exports.deleteDish = deleteDish;
