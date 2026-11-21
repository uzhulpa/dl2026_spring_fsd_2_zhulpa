import { Router } from "express";

import GameController from "../controllers/GameController.js";
import validate from "../middlewares/validate.js";
import { infiniteAnswerSchema, collectionAnswerSchema } from "../validations/gameValidation.js";

const GameRouter = new Router();

GameRouter.get('/infinite/question', GameController.getInfiniteModeNextQuestion);

GameRouter.post(
    '/infinite/answer',
    validate(infiniteAnswerSchema),
    GameController.saveInfiniteModeAnswer
);

GameRouter.post(
    '/collection/answer',
    validate(collectionAnswerSchema),
    GameController.saveCollectionModeAnswer
);

export default GameRouter;