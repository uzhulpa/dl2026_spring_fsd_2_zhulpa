import GameService from "../services/GameService.js";

class GameController {
    async getInfiniteModeNextQuestion(req, res) {
        try {
            const payload = await GameService.getRandomQuestionForInfinite(req.user.id);

            if (!payload) {
                return res.status(404).json({
                    success: false,
                    message: "Нет доступных вопросов",
                });
            }

            return res.status(200).json(payload);
        } catch (error) {
            console.error("Infinite question error:", error);
            return res.status(500).json({
                success: false,
                message: "Не удалось получить вопрос",
            });
        }
    }

    async saveInfiniteModeAnswer(req, res) {
        try {
            const result = await GameService.recordInfiniteAnswer(req.user.id, req.body);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Вопрос не найден",
                });
            }

            return res.status(200).json(result);
        } catch (error) {
            console.error("Infinite answer error:", error);
            return res.status(500).json({
                success: false,
                message: "Не удалось сохранить ответ",
            });
        }
    }

    async saveCollectionModeAnswer(req, res) {
        try {
            const result = await GameService.recordCollectionAnswer(req.user.id, req.body);

            if (result.kind === "session_not_found") {
                return res.status(404).json({
                    success: false,
                    message: "Сессия не найдена",
                });
            }

            if (result.kind === "forbidden") {
                return res.status(403).json({
                    success: false,
                    message: "Нет доступа к этой сессии",
                });
            }

            if (result.kind === "session_completed") {
                return res.status(400).json({
                    success: false,
                    message: "Сессия уже завершена",
                });
            }

            if (result.kind === "wrong_question") {
                return res.status(400).json({
                    success: false,
                    message: "Ответ не соответствует текущему вопросу сессии",
                });
            }

            if (result.kind === "question_not_found") {
                return res.status(500).json({
                    success: false,
                    message: "Вопрос не найден",
                });
            }

            return res.status(200).json(result.data);
        } catch (error) {
            console.error("Collection answer error:", error);
            return res.status(500).json({
                success: false,
                message: "Не удалось сохранить ответ",
            });
        }
    }
}

export default new GameController();