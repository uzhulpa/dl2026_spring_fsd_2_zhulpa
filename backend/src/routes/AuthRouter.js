import { Router } from "express";

import AuthController from "../controllers/AuthController.js";

import validate from "../middlewares/validate.js";
import { createUserSchema, loginSchema } from "../validations/userValidation.js";

const AuthRouter = new Router();

AuthRouter.post('/registration', validate(createUserSchema), AuthController.registration);
AuthRouter.post('/login', validate(loginSchema), AuthController.login);

export default AuthRouter;