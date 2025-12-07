import { Router } from "express";

import { updateTask } from "../controllers/task.controller.js";
import authorize from '../middlewares/auth.middleware.js'

const taskRouter = Router();

taskRouter.post('/update', authorize, updateTask);

export default taskRouter;