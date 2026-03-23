export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

export const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
