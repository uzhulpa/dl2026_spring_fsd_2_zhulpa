import jwt from 'jsonwebtoken'
import 'dotenv/config';

const assertJwtSecretConfigured = () => {
  const key = process.env.SECRET_KEY;
  if (!key || String(key).trim() === '') {
    throw new Error('SECRET_KEY must be set in environment variables');
  }
};

const SECRET_KEY = process.env.SECRET_KEY;

const generateAccessToken = (id, username, role) => {
    const payload = {
        id,
        username,
        role
    }
    return jwt.sign(payload, SECRET_KEY, {expiresIn: '24h'});
}

const verifyAccessToken = (token) => {
    const decodedData = jwt.verify(token, SECRET_KEY);
    return decodedData;
}

export {
    assertJwtSecretConfigured,
    generateAccessToken,
    verifyAccessToken
}