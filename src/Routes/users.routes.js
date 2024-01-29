import { Router } from "express";
import { authorization, passportError } from "../utils/messagesError.js";
import {
  getAll,
  getById,
  putById,
  deleteByid,
  pwRecovery,
  pwReset,
  documentsUpload,
  profilePicsUpload,
  prodPicsUpload,
  deleteInactiveUser,
} from "../controllers/users.controllers.js";
import { Docs, ProfPics, prodPics } from "../utils/multer.js";
import "dotenv/config.js";
const userRouter = Router();

userRouter.get("/", authorization(process.env.ROL_ADMIN), getAll);
userRouter.get("/:uid", passportError("jwt"), getById);
userRouter.put("/:uid", passportError("jwt"), putById);
userRouter.delete("/:uid", passportError("jwt"), deleteByid);

userRouter.delete("/delete/delete", deleteInactiveUser);
userRouter.post("/password-recovery", pwRecovery);
userRouter.post("/reset-password/:token", pwReset);

userRouter.post(
  "/docsUpload",

  Docs.single("img"),
  documentsUpload
);
userRouter.post(
  "/:uid/profPicsUpload",

  ProfPics.single("img"),
  profilePicsUpload
);
userRouter.post(
  "/prodPicsUpload",

  prodPics.single("img"),
  prodPicsUpload
);

export default userRouter;
