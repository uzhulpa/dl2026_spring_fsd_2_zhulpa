import CollectionService from "../services/CollectionService.js";

class CollectionController {
    async getAllCollections(req, res) {
        try {
            const collections = await CollectionService.getAllCollections();

            res.status(200).json({
                success: true,
                data: collections
            });
        }

        catch (error) {
            console.error('Collections error:', error);
            return res.status(500).json({
                success: false,
                message: 'Не удалось получить коллекции'
            });
        }
        
    }

    async startCollectionSession(req, res) {
        try {
            const result = await CollectionService.startCollectionSession(
                req.user.id,
                req.params.collectionId
            );

            if (result.kind === "invalid_id") {
                return res.status(400).json({
                    success: false,
                    message: "Некорректный идентификатор коллекции",
                });
            }

            if (result.kind === "not_found") {
                return res.status(404).json({
                    success: false,
                    message: "Коллекция не найдена",
                });
            }

            if (result.kind === "empty_collection") {
                return res.status(400).json({
                    success: false,
                    message: "В коллекции нет вопросов",
                });
            }

            if (result.kind === "question_not_found") {
                return res.status(500).json({
                    success: false,
                    message: "Вопрос сессии не найден",
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data,
            });
        } catch (error) {
            console.error("Start collection session error:", error);
            return res.status(500).json({
                success: false,
                message: "Не удалось создать сессию",
            });
        }
    }
}

export default new CollectionController();