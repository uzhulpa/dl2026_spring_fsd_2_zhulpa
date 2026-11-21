import { Router } from "express";

import validate from "../../middlewares/validate.js";
import adminQuestionSchema from "../../validations/questionValidation.js";

import AdminQuestionsController from "../../controllers/admin/AdminQuestionsController.js";

const AdminQuestionsRouter = new Router();

AdminQuestionsRouter.get('/', AdminQuestionsController.getQuestions);
AdminQuestionsRouter.get('/suggest', AdminQuestionsController.suggestQuestionsByTitle);
AdminQuestionsRouter.get('/:questionId', AdminQuestionsController.getQuestionById);
AdminQuestionsRouter.put('/:questionId', validate(adminQuestionSchema), AdminQuestionsController.updateQuestionById);
AdminQuestionsRouter.post('/', validate(adminQuestionSchema), AdminQuestionsController.addQuestion);

export default AdminQuestionsRouter;