import jwt, { JwtPayload } from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-change-this';
  
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload | string => {
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-change-this';
  
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
