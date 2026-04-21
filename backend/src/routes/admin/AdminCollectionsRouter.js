import { Router } from "express";

import AdminCollectionsController from "../../controllers/admin/AdminCollectionsController.js";

const AdminCollectionsRouter = new Router();

AdminCollectionsRouter.get('/', AdminCollectionsController.getCollections);
AdminCollectionsRouter.get('/:collectionId', AdminCollectionsController.getCollectionById);

export default AdminCollectionsRouter;