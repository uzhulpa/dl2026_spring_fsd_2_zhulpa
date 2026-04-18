import { Router } from "express";

import CollectionController from "../controllers/CollectionController.js";

const CollectionRouter = new Router();

CollectionRouter.get('/', CollectionController.getAllCollections);

CollectionRouter.get('/:collectionId/start', CollectionController.startCollectionSession);

export default CollectionRouter;