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

    async putCollectionById(collectionId, newData) {
        const transaction = await sequelize.transaction();

        try {
            const collection = await Collection.findByPk(collectionId, { transaction });

            if (!collection) {
                await transaction.rollback();
                return null;
            }

            const collectionUpdateData = {};
        
            if (newData.name !== undefined) {
                collectionUpdateData.name = newData.name;
            }
            if (newData.description !== undefined) {
                collectionUpdateData.description = newData.description;
            }
            if (newData.random_order !== undefined) {
                collectionUpdateData.random_order = newData.random_order;
            }

            await collection.update(collectionUpdateData, { transaction });

            if (newData.questions !== undefined && Array.isArray(newData.questions)) {
                await CollectionQuestion.destroy({
                    where: { collection_id: collectionId },
                    transaction
                });

                const collectionQuestions = newData.questions.map(q => ({
                    collection_id: collectionId,
                    question_id: q.question_id,
                    position: q.position
                }));

                await CollectionQuestion.bulkCreate(collectionQuestions, { transaction });
            }

            console.log(`Collection ${collectionId} updated by admin with data:`, newData);

            await transaction.commit();

            const newCollection = await this.getCollectionById(collectionId);

            return newCollection;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async addCollection(newData, authorId) {
        const transaction = await sequelize.transaction();

        try {
            const collection = await Collection.create({
                name: newData.name,
                description: newData.description,
                random_order: newData.random_order,
                author_id: authorId
            });

            console.log(collection);

            if (newData.questions !== undefined && Array.isArray(newData.questions)) {
                const collectionQuestions = newData.questions.map(q => ({
                    collection_id: collection.id,
                    question_id: q.question_id,
                    position: q.position
                }));

                await CollectionQuestion.bulkCreate(collectionQuestions, { transaction });
            }

            console.log(`Collection ${collection.id} created by admin with data:`, newData);

            await transaction.commit();

            const newCollection = await this.getCollectionById(collection.id);

            return newCollection;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export default new AdminCollectionsService();