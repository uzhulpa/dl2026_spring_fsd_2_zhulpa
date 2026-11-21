import { AnswerAttempt, User, sequelize } from "../models/index.js";

class LeaderboardService {

    async getInfiniteLeaders(limit=10, offset=0) {
        const results = await sequelize.query(
            `SELECT 
                u.id AS user_id,
                u.username,
                COALESCE(SUM(aa.score_awarded), 0) AS total_score
            FROM users u
            INNER JOIN answer_attempts aa ON u.id = aa.user_id
            WHERE aa.game_mode = 'infinite'
            GROUP BY u.id, u.username
            ORDER BY total_score DESC
            LIMIT :limit OFFSET :offset`,
            {
                replacements: { limit, offset: offset || 0 },
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        return results;
    }

    async getCollectionLeaders(collectionId, limit=10, offset=0) {
        const results = await sequelize.query(
            `SELECT 
                u.id AS user_id,
                u.username,
                MAX(gs.total_score) AS total_score
            FROM users u
            INNER JOIN game_sessions gs ON u.id = gs.user_id
            INNER JOIN answer_attempts aa ON gs.id = aa.session_id
            WHERE gs.collection_id = :collectionId
                AND aa.game_mode = 'collection'
            GROUP BY u.id, u.username
            HAVING COUNT(aa.id) > 0
            ORDER BY total_score DESC
            LIMIT :limit OFFSET :offset`,
            {
                replacements: { collectionId, limit, offset: offset || 0 },
                type: sequelize.QueryTypes.SELECT
            }
        );
        
        return results;
    }
}

export default new LeaderboardService();