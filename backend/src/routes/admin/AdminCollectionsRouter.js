import { Router } from "express";

import validate from "../../middlewares/validate.js";
import { updateCollectionSchema, createCollectionSchema } from "../../validations/collectionValidation.js";

import AdminCollectionsController from "../../controllers/admin/AdminCollectionsController.js";

const AdminCollectionsRouter = new Router();

AdminCollectionsRouter.get('/', AdminCollectionsController.getCollections);
AdminCollectionsRouter.get('/:collectionId', AdminCollectionsController.getCollectionById);
AdminCollectionsRouter.put('/:collectionId', validate(updateCollectionSchema), AdminCollectionsController.updateCollectionById);
AdminCollectionsRouter.post('/', validate(createCollectionSchema), AdminCollectionsController.createCollection);

export default AdminCollectionsRouter;