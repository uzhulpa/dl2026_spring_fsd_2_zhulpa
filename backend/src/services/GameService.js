import { Question, AnswerAttempt, GameSession, sequelize } from "../models/index.js";

import { calculateScore } from "../utils/math/calculator.js";

class GameService {
    /**
     * @param {number} _userId id из JWT (зарезервировано под сессию / исключения повторов)
     */
    async getRandomQuestionForInfinite(_userId) {
        const row = await Question.findOne({
            where: { status: "active" },
            attributes: ["id", "title", "image_url", "difficulty"],
            order: sequelize.literal("RANDOM()"),
        });

        if (!row) {
            return null;
        }

        return {
            question_id: row.id,
            title: row.title,
            image_url: row.image_url,
            difficulty: row.difficulty,
        };
    }

    /**
     * @param {number} userId
     * @param {{ question_id: number, click_longitude: number, click_latitude: number, response_time_ms: number }} payload
     */
    async recordInfiniteAnswer(userId, payload) {
        const { question_id, click_longitude, click_latitude, response_time_ms } = payload;

        const question = await Question.findByPk(question_id, {
            attributes: ["id", "correct_latitude", "correct_longitude", "question_type", "radius_meters", "description", "difficulty"],
        });

        if (!question) {
            return null;
        }

        const correctLat = Number(question.correct_latitude);
        const correctLon = Number(question.correct_longitude);

        const result = calculateScore({
            clickPoint: {
                latitude: click_latitude,
                longitude: click_longitude
            },
            correctPoint: {
                latitude: correctLat,
                longitude: correctLon
            },
            questionType: question.question_type,
            radiusMeters: question.radius_meters,
            responseTimeMs: response_time_ms,
            difficulty: question.difficulty
        });

        const hasInfiniteAttemptForQuestion = await AnswerAttempt.findOne({
            where: {
                user_id: userId,
                question_id,
                game_mode: "infinite",
            },
            attributes: ["id"],
        });

        const scoreAwarded = hasInfiniteAttemptForQuestion ? 0 : result.score_awarded;

        await AnswerAttempt.create({
            user_id: userId,
            question_id,
            game_mode: "infinite",
            session_id: null,
            click_longitude,
            click_latitude,
            distance_km: result.distance_km,
            response_time_ms,
            score_awarded: scoreAwarded,
        });

        return {
            correct_longitude: correctLon,
            correct_latitude: correctLat,
            distance_km: result.distance_km,
            score_awarded: scoreAwarded,
            feedback: question.description,
        };
    }

    /**
     * @param {number} userId
     * @param {{ session_id: number, question_id: number, click_longitude: number, click_latitude: number, response_time_ms: number }} payload
     */
    async recordCollectionAnswer(userId, payload) {
        const { session_id, question_id, click_longitude, click_latitude, response_time_ms } = payload;

        return sequelize.transaction(async (transaction) => {
            const session = await GameSession.findByPk(session_id, {
                transaction,
                lock: true,
            });

            if (!session) {
                return { kind: "session_not_found" };
            }

            if (Number(session.user_id) !== Number(userId)) {
                return { kind: "forbidden" };
            }

            if (session.session_status !== "active") {
                return { kind: "session_completed" };
            }

            const idx = session.current_question_index;
            const expectedId = session.question_order[idx];

            if (expectedId === undefined || Number(expectedId) !== Number(question_id)) {
                return { kind: "wrong_question" };
            }

            const question = await Question.findByPk(question_id, {
                attributes: ["id", "correct_latitude", "correct_longitude", "question_type", "radius_meters", "description", "difficulty"],
                transaction,
            });

            if (!question) {
                return { kind: "question_not_found" };
            }

            const correctLat = Number(question.correct_latitude);
            const correctLon = Number(question.correct_longitude);
            
            const result = calculateScore({
                clickPoint: {
                    latitude: click_latitude,
                    longitude: click_longitude
                },
                correctPoint: {
                    latitude: correctLat,
                    longitude: correctLon
                },
                questionType: question.question_type,
                radiusMeters: question.radius_meters,
                responseTimeMs: response_time_ms,
                difficulty: question.difficulty
            });

            const newIdx = idx + 1;
            const totalQuestions = session.question_order.length;
            const isLast = newIdx >= totalQuestions;
            const newTotalScore = Number(session.total_score) + result.score_awarded;

            let nextQuestion = null;
            if (!isLast) {
                const nextQuestionId = session.question_order[newIdx];
                nextQuestion = await Question.findByPk(nextQuestionId, {
                    attributes: ["id", "title", "image_url", "difficulty"],
                    transaction,
                });

                if (!nextQuestion) {
                    return { kind: "question_not_found" };
                }
            }

            await AnswerAttempt.create(
                {
                    user_id: userId,
                    question_id,
                    game_mode: "collection",
                    session_id,
                    click_longitude,
                    click_latitude,
                    distance_km: result.distance_km,
                    response_time_ms,
                    score_awarded: result.score_awarded,
                },
                { transaction }
            );

            if (isLast) {
                await session.update(
                    {
                        current_question_index: newIdx,
                        total_score: newTotalScore,
                        session_status: "completed",
                        completed_at: new Date(),
                    },
                    { transaction }
                );
            } else {
                await session.update(
                    {
                        current_question_index: newIdx,
                        total_score: newTotalScore,
                    },
                    { transaction }
                );
            }

            const base = {
                correct_longitude: correctLon,
                correct_latitude: correctLat,
                distance_km: result.distance_km,
                score_awarded: result.score_awarded,
                feedback: question.description,
                session_id: session.id,
                total_questions: totalQuestions,
                questions_answered: newIdx,
                total_score: newTotalScore,
                session_status: isLast ? "completed" : "active",
            };

            if (nextQuestion) {
                base.next_question = {
                    order: newIdx + 1,
                    question_id: nextQuestion.id,
                    title: nextQuestion.title,
                    image_url: nextQuestion.image_url,
                    difficulty: nextQuestion.difficulty,
                };
            }

            return { kind: "ok", data: base };
        });
    }
}

export default new GameService();