import { Collection, Question, CollectionQuestion, sequelize } from "../../models/index.js";
import { fn, col } from "sequelize";

class AdminCollectionsService {
    async getCollections(limit=10, offset=0) {
        const collections = await Collection.findAll({
            attributes: [
                "id",
                "name",
                "description",
                "random_order",
                "author_id",
                "created_at",
                [sequelize.cast(fn("COUNT", col("CollectionQuestions.id")), "integer"), "questions_count"],
            ],
            include: [
                {
                    model: CollectionQuestion,
                    attributes: [],
                    required: false,
                },
            ],
            group: [
                "Collection.id",
                "Collection.name",
                "Collection.description",
                "Collection.random_order",
                "Collection.author_id",
                "Collection.created_at",
            ],
            subQuery: false,
            limit: limit,
            offset: offset,
            order: [['created_at', 'ASC']]
        });
        
        return collections;
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