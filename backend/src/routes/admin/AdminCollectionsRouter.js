import { Router } from "express";

import validate from "../../middlewares/validate.js";
import { updateCollectionSchema } from "../../validations/collectionValidation.js";

import AdminCollectionsController from "../../controllers/admin/AdminCollectionsController.js";

const AdminCollectionsRouter = new Router();

AdminCollectionsRouter.get('/', AdminCollectionsController.getCollections);
AdminCollectionsRouter.get('/:collectionId', AdminCollectionsController.getCollectionById);
AdminCollectionsRouter.put('/:collectionId', validate(updateCollectionSchema), AdminCollectionsController.updateCollectionById);

export default AdminCollectionsRouter;