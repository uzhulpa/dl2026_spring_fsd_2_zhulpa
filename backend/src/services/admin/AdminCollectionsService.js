import { Collection, Question, CollectionQuestion, sequelize } from "../../models/index.js";

class AdminCollectionsService {
    async getCollections(limit=10, offset=0) {
        const result = await Collection.findAll({
            limit: limit,
            offset: offset,
            order: [['created_at', 'ASC']]
        });

        return result;
    }

    async getCollectionById(collectionId) {
        const result = await Collection.findOne({
            where: {
                id: collectionId
            },
            include: [{
                model: Question,
                through: {
                    attributes: ['position'],
                    order: [['position', 'ASC']]
                },
                attributes: [
                    'id',
                    'title',
                    'description',
                    'image_url',
                    'correct_longitude',
                    'correct_latitude',
                    'question_type',
                    'radius_meters',
                    'difficulty',
                    'status'
                ],
                order: [[{model: CollectionQuestion, as: 'CollectionQuestion'}, 'position', 'ASC']]
            }],
            order: [[Question, CollectionQuestion, 'position', 'ASC']]
        });

        return result;
    }
}

export default new AdminCollectionsService();