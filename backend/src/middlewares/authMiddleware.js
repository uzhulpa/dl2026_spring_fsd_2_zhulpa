import { verifyAccessToken } from "../utils/jwtTokensUtil.js";

const authMiddleware = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не авторизован'
            });
        }

        const token = authHeader.slice(7).trim();
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не авторизован'
            });
        }

        const decodedData = verifyAccessToken(token);
        req.user = decodedData;
        next();
    }

    catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            message: 'Пользователь не авторизован'
        });
    }
}

export default authMiddleware;
