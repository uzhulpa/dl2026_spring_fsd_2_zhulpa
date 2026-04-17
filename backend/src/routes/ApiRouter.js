import { Router } from "express";

import AuthRouter from "./AuthRouter.js";
import HealthRouter from "./HealthRouter.js";
import usersRouter from "./UsersRouter.js";
import GameRouter from "./GameRouter.js";

const apiRouter = new Router();

apiRouter.use('/auth', AuthRouter);
apiRouter.use('/health', HealthRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/game', GameRouter);

export default apiRouter;