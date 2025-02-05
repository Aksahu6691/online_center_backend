import { User } from "../api/user/UserModel";

declare namespace Express {
    interface Request {
        user?: User | string;
    }
}