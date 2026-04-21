import LeaderboardService from "../services/LeaderboardService.js";

class LeaderboardController {
    async getInfiniteLeaders(req, res) {

        try {
            const limit = req.query.limit;
            const offset = req.query.offset;

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
            const limit = req.query.limit;
            const offset = req.query.offset;

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