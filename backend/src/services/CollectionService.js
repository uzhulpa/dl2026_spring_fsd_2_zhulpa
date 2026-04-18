import {
    Collection,
    CollectionQuestion,
    GameSession,
    Question,
    sequelize,
} from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { fn, col } from "sequelize";

function shuffleArrayInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

class CollectionService {
    async getAllCollections() {
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
        });

        return collections;
    }

    /**
     * @param {number} userId
     * @param {string|number} collectionId из params
     */
    async startCollectionSession(userId, collectionId) {
        const cid = Number.parseInt(String(collectionId), 10);
        if (!Number.isInteger(cid) || cid < 1) {
            return { kind: "invalid_id" };
        }

        const collection = await Collection.findByPk(cid, {
            attributes: ["id", "random_order"],
        });

        if (!collection) {
            return { kind: "not_found" };
        }

        const links = await CollectionQuestion.findAll({
            where: { collection_id: cid },
            attributes: ["question_id"],
            order: [["position", "ASC"]],
        });

        if (links.length === 0) {
            return { kind: "empty_collection" };
        }

        const question_order = links.map((row) => row.question_id);
        if (collection.random_order) {
            shuffleArrayInPlace(question_order);
        }

        const session = await GameSession.create({
            user_id: userId,
            collection_id: cid,
            question_order,
        });

        const firstQuestionId = question_order[0];
        const question = await Question.findByPk(firstQuestionId, {
            attributes: ["id", "title", "image_url", "difficulty"],
        });

        if (!question) {
            return { kind: "question_not_found" };
        }

        const idx = session.current_question_index;
        const data = {
            session_id: session.id,
            total_questions: question_order.length,
            current_question: {
                order: idx + 1,
                question_id: question.id,
                title: question.title,
                image_url: question.image_url,
                difficulty: question.difficulty,
            },
        };

        return { kind: "ok", data };
    }

}

export default new CollectionService();