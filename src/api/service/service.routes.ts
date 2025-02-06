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
  .post("/add", upload.single("image"), addService)
  .patch("/update/:id", upload.single("image"), updateService)
  .delete("/delete/:id", deleteService);

export default serviceRoutes;
