import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../utils/jwtTokensUtil.js";
import { AppError } from "../utils/appError.js";

const BCRYPT_ROUNDS = Number.parseInt(process.env.BCRYPT_ROUNDS ?? "10", 10);
const SAFE_BCRYPT_ROUNDS = Number.isInteger(BCRYPT_ROUNDS) && BCRYPT_ROUNDS >= 4 && BCRYPT_ROUNDS <= 31
    ? BCRYPT_ROUNDS
    : 10;

class AuthService {
    async registerUser(username, email, password) {
        const existingUsername = await User.findOne({ 
            where: { username } 
        });
        if (existingUsername) {
            throw new AppError('USERNAME_ALREADY_EXISTS');
        }

        const existingEmail = await User.findOne({ 
            where: { email } 
        });
        if (existingEmail) {
            throw new AppError('EMAIL_ALREADY_EXISTS');
        }

        const password_hash = await bcrypt.hash(password, SAFE_BCRYPT_ROUNDS);

        const user = await User.create({username, email, password_hash});
        
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
    }

    async authenticateUser(email, password) {
        const existingUser = await User.findOne({where: {email}});
        if (!existingUser) {
            throw new AppError('INVALID_LOGIN');
        }

        const validPassword = await bcrypt.compare(password, existingUser.password_hash);
        if (!validPassword) {
            throw new AppError('INVALID_LOGIN');
        }

        const newToken = generateAccessToken(existingUser.id, existingUser.username, existingUser.role);

        return {
            access_token: newToken,
            token_type: 'Bearer',
            user: {
                id: existingUser.id,
                username: existingUser.username,
                role: existingUser.role
            }
        };
    }
}

export default new AuthService();
