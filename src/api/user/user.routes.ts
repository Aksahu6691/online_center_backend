import express from "express";
import { addUser, deleteUser, getUser, updateUser } from "./user.controller";
import { userLogin } from "./user.creadential";
import { upload } from "../../utils/fileUpload";

const userRoutes = express.Router();

userRoutes
  .post("/add", upload.single("photo"), addUser)
  .get("/get/:id?", getUser)
  .patch("/update/:id", upload.single("photo"), updateUser)
  .delete("/delete/:id", deleteUser)
  .post("/login", userLogin);

export default userRoutes;
