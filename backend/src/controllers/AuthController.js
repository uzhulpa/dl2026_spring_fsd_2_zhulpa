import AuthService from "../services/AuthService.js";
import { AppError } from "../utils/appError.js";

class AuthController {
    async registration(req, res) {
        try {
            const {username, email, password} = req.body;

            const user = await AuthService.registerUser(username, email, password);

            res.status(201).json({
                success: true,
                data: user
            });
        }
        catch (error) {
            if (error instanceof AppError) {
                switch (error.code) {
                    case 'USERNAME_ALREADY_EXISTS':
                        return res.status(409).json({
                            success: false,
                            message: 'Пользователь с таким никнеймом уже существует'
                        });
                    case 'EMAIL_ALREADY_EXISTS':
                        return res.status(409).json({
                            success: false,
                            message: 'Пользователь с таким email уже существует'
                        });
                    default:
                        break;
                }
            }
            console.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка при регистрации пользователя'
            });
        }
    }

    async login(req, res) {
        try {
            const {email, password} = req.body;

            const newToken = await AuthService.authenticateUser(email, password);

            res.status(200).json({
                success: true,
                data: newToken
            });
        }
        catch (error) {
            if (error instanceof AppError && error.code === 'INVALID_LOGIN') {
                return res.status(401).json({
                    success: false,
                    message: 'Неверный email или пароль'
                });
            }
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Ошибка при аутентификации'
            });
        }
    }
}

export default new AuthController();
