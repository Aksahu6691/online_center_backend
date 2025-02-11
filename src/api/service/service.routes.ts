import express from "express";
import {
  addService,
  deleteService,
  getService,
  updateService,
} from "./service.controller";
import { upload } from "../../utils/fileUpload";
import { protect } from "../../middleware/authentication";

const serviceRoutes = express.Router();

serviceRoutes
  .get("/get/:id?", protect, getService)
  .post("/add", protect, upload.single("image"), addService)
  .patch("/update/:id", protect, upload.single("image"), updateService)
  .delete("/delete/:id", protect, deleteService);

export default serviceRoutes;
