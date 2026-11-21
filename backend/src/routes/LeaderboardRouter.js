import { Router } from "express";

import LeaderboardController from "../controllers/LeaderboardController.js";

const LeaderboardRouter = new Router();

LeaderboardRouter.get('/infinite', LeaderboardController.getInfiniteLeaders);
LeaderboardRouter.get('/collection/:collectionId', LeaderboardController.getCollectionLeaders);

export default LeaderboardRouter;