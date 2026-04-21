import AdminQuestionsService from "../../services/admin/AdminQuestionsService.js";

class AdminQuestionsController {
    async getQuestions(req, res){
        try {
            const status = (typeof req.query.status == 'undefined' ? null : req.query.status);
            const page = (typeof req.query.page == 'undefined' ? 1 : req.query.page);
            const perPage = (typeof req.query.perPage == 'undefined' ? 10 : req.query.perPage);

            const limit = perPage;
            const offset = (page-1) * perPage;

            const result = await AdminQuestionsService.getQuestions(status, limit, offset);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Admin (questions) error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при получении списка вопросов'
            });
        }
    }

    async getQuestionById(req, res) {
        try {
            const questionId = req.params.questionId;

            const result = await AdminQuestionsService.getQuestionById(questionId);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Admin (questions) error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при получении данных вопроса'
            });
        }
    }

    async updateQuestionById(req, res) {
        try {
            const questionId = req.params.questionId;
            const newData = req.body;

            const result = await AdminQuestionsService.putQuestionById(questionId, newData);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Admin (questions) error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при обновлении данных вопроса'
            });
        }
    }

    async addQuestion(req, res) {
        try {
            const newData = req.body;

            const result = await AdminQuestionsService.addQuestion(newData, req.user.id);

            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Admin (questions) error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при добавлении нового вопроса'
            });
        }
    }
}

export default new AdminQuestionsController();