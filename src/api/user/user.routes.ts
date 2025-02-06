import express from "express";
import { addUser, deleteUser, getUser, updateUser } from "./user.controller";
import { userLogin, VerifyLogin } from "./user.creadential";
import { upload } from "../../utils/fileUpload";
import { protect } from "../../middleware/authentication";

const userRoutes = express.Router();

userRoutes
  .post("/add", upload.single("photo"), addUser)
  .get("/get/:id?", protect, getUser)
  .patch("/update/:id", upload.single("photo"), updateUser)
  .delete("/delete/:id", deleteUser)
  .post("/login", userLogin)
  .post("/verify-login", protect, VerifyLogin); // TODO: Will do later

export default userRoutes;
