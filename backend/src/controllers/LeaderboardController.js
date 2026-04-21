import LeaderboardService from "../services/LeaderboardService.js";

class LeaderboardController {
    async getInfiniteLeaders(req, res) {
        try {
            const page = (typeof req.query.page == 'undefined' ? 1 : req.query.page);
            const perPage = (typeof req.query.perPage == 'undefined' ? 10 : req.query.perPage);

            const limit = perPage;
            const offset = (page-1) * perPage;

            const result = await LeaderboardService.getInfiniteLeaders(limit, offset);

            res.status(200).json({
                status: true,
                data: result
            });
        }
        catch (error) {
            console.error(`Leaderboard error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при составлении списка лидеров'
            });
        }
    }

    async getCollectionLeaders(req, res) {

        try {
            const collectionId = req.params.collectionId;
            const page = (typeof req.query.page == 'undefined' ? 1 : req.query.page);
            const perPage = (typeof req.query.perPage == 'undefined' ? 10 : req.query.perPage);

            const limit = perPage;
            const offset = (page-1) * perPage;

            const result = await LeaderboardService.getCollectionLeaders(collectionId, limit, offset);

            res.status(200).json({
                    status: true,
                    data: result
                });
        }
        catch (error) {
            console.error(`Leaderboard error: ${error}`);

            return res.status(500).json({
                success: false,
                message: 'Ошибка при составлении списка лидеров'
            });
        }
    }
}

export default new LeaderboardController();