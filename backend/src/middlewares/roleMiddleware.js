const roleMiddleware = (requiredRole) => (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Пользователь не авторизован'
        });
    }

    if (req.user.role !== requiredRole) {
        return res.status(403).json({
            success: false,
            message: 'Нет доступа'
        });
    }

    next();
};

export default roleMiddleware;
