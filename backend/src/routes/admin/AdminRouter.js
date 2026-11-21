import { Router } from "express";

import AdminQuestionsRouter from "./AdminQuestionsRouter.js";
import AdminCollectionsRouter from "./AdminCollectionsRouter.js";

const AdminRouter = new Router();

AdminRouter.use('/questions', AdminQuestionsRouter);
AdminRouter.use('/collections', AdminCollectionsRouter);

export default AdminRouter;