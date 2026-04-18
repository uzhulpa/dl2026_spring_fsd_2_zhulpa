import { Router } from "express";

import authMiddleware from "../middlewares/authMiddleware.js";

import AuthRouter from "./AuthRouter.js";
import HealthRouter from "./HealthRouter.js";
import CollectionRouter from "./CollectionRouter.js";
import GameRouter from "./GameRouter.js";

const ApiRouter = new Router();

ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/health', HealthRouter);
ApiRouter.use('/game', authMiddleware, GameRouter);
ApiRouter.use('/collections', authMiddleware, CollectionRouter);

export default ApiRouter;