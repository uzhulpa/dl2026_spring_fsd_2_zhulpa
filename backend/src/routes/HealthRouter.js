import { Router } from "express";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const healthRouter = new Router();

healthRouter.get('/every', (req, res) => {
    res.status(200).json('every health ok');
});
healthRouter.get('/authorized', authMiddleware, (req, res) => {
    res.status(200).json('authorized health ok');
});
healthRouter.get('/admin', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.status(200).json('admin health ok');
});

export default healthRouter;