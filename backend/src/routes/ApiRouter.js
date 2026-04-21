import { Router } from "express";

import authMiddleware from "../middlewares/authMiddleware.js";

import AuthRouter from "./AuthRouter.js";
import HealthRouter from "./HealthRouter.js";
import CollectionRouter from "./CollectionRouter.js";
import GameRouter from "./GameRouter.js";
import LeaderboardRouter from "./LeaderboardRouter.js";

const ApiRouter = new Router();

ApiRouter.use('/auth', AuthRouter);
ApiRouter.use('/health', HealthRouter);
ApiRouter.use('/game', authMiddleware, GameRouter);
ApiRouter.use('/collections', authMiddleware, CollectionRouter);
ApiRouter.use('/leaderboard', LeaderboardRouter);

export default ApiRouter;