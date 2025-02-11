import express from "express";
import { addUser, deleteUser, getUser, updateUser } from "./user.controller";
import { upload } from "../../utils/fileUpload";
import { protect } from "../../middleware/authentication";
import { userLogin, VerifyLogin } from "./user.credentials";

const userRoutes = express.Router();

userRoutes
  .post("/add", upload.single("photo"), addUser)
  .get("/get/:id?", protect, getUser)
  .patch("/update/:id", protect, upload.single("photo"), updateUser)
  .delete("/delete/:id", protect, deleteUser)
  .post("/login", userLogin)
  .post("/verify-login", VerifyLogin);

export default userRoutes;
