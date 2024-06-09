import { Router } from "express";
import { getUsersByIds, updateAvatar } from "../../../controller/user.controller.js";

const userRouter = Router();

userRouter.put("/:id", updateAvatar);
userRouter.put("/get/users", getUsersByIds);

export default userRouter;