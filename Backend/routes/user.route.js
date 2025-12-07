import { Router } from "express";

import { getUser, getUsers } from "../controllers/user.controller.js";
import authorize from '../middlewares/auth.middleware.js'

const userRouter = Router();

userRouter.get("/", authorize, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  getUsers(req, res, next);
});
userRouter.get('/data',authorize, getUser);
userRouter.put('/:id',(req,res) => res.send({title:"UPDATE user"}));
userRouter.delete('/:id',(req,res) => res.send({title:"DELETE user"}));

export default userRouter;