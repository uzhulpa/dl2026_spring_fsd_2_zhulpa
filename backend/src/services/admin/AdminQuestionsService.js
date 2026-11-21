import { Question, sequelize } from "../../models/index.js";
import { Op } from "sequelize";

class AdminQuestionsService {
    async getQuestions(status, limit=10, offset=0) {
        const result = await Question.findAll({
            where: status ? { status } : {},
            limit: limit,
            offset: offset,
            order: [['created_at', 'ASC']]
        });

        return result;
    }

    async getQuestionById(questionId) {
        const result = await Question.findOne({
            where: {
                id: questionId
            }
        });

        return result;
    }

    async putQuestionById(questionId, newData) {
        const transaction = await sequelize.transaction();

        try {
            const question = await Question.findByPk(questionId, { transaction });

            if (!question) {
                await transaction.rollback();
                return null;
            }

            await question.update(newData, { transaction });

            console.log(`Question ${questionId} updated by admin with data:`, newData);

            await transaction.commit();

            return await Question.findByPk(questionId);
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async addQuestion(newData, authorId) {
        const transaction = await sequelize.transaction();

        try {
            const question = await Question.create({
                title: newData.title,
                description: newData.description,
                image_url: newData.image_url,
                correct_longitude: newData.correct_longitude,
                correct_latitude: newData.correct_latitude,
                question_type: newData.question_type,
                radius_meters: newData.radius_meters,
                difficulty: newData.difficulty,
                author_id: authorId
            });

            await transaction.commit();

            return question;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getQuestionsByTitle(questionTitle) {
        try {
            const searchTerm = questionTitle.toLowerCase().trim();

            const questions = await Question.findAll({
                where: {
                    status: 'active',
                    title: {
                        [Op.iLike]: `%${searchTerm}%`
                    }
                },
                attributes: ['id', 'title'],
                order: [['title', 'ASC']]
            });

            if (!questions || questions.length === 0) {
                return [];
            }

            const fullQuestions = await Promise.all(
                questions.map(question => this.getQuestionById(Number(question.id)))
            );

            return fullQuestions.filter(q => q !== null);
        }
        catch (error) {
            throw error;
        }
    }
}

export default new AdminQuestionsService();