import AdminCollectionsService from "../../services/admin/AdminCollectionsService.js";

class AdminCollectionsController {
    async getCollections(req, res) {
        try {
            const page = (typeof req.query.page == 'undefined' ? 1 : req.query.page);
            const perPage = (typeof req.query.perPage == 'undefined' ? 10 : req.query.perPage);

            const limit = perPage;
            const offset = (page-1) * perPage;

            const result = await AdminCollectionsService.getCollections(limit, offset);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Admin (collections) error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при получении списка коллекций'
            });
        }
    }

    async getCollectionById(req, res) {
        try {
            const collectionId = req.params.collectionId;

            const result = await AdminCollectionsService.getCollectionById(collectionId);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Admin (collections) error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при получении данных коллекции'
            });
        }
    }

    async updateCollectionById(req, res) {
        try {
            const collectionId = req.params.collectionId;
            const newData = req.body;

            const result = await AdminCollectionsService.putCollectionById(collectionId, newData);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Admin (collections) error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при обновлении данных коллекции'
            });
        }
    }

    async createCollection(req, res) {
        try {
            const newData = req.body;

            const result = await AdminCollectionsService.addCollection(newData, req.user.id);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Admin (collections) error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при создании коллекции'
            });
        }
    }
}

export default new AdminCollectionsController();