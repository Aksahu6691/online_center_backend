import { Users } from "../api/user/user.model";

declare module "express-serve-static-core" {
  interface Request {
    user?: Users;
  }
}
