const crypto = require('crypto');

// Simple JWT-like token for admin authentication
// In production, consider using a proper JWT library

const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'mybounceplace-admin-secret-key-change-in-production';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Admin credentials (in production, store hashed in database)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mybounceplace.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'BouncePlaceAdmin2025!';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + SECRET_KEY).digest('hex');
}

function generateToken(email) {
  const payload = {
    email,
    exp: Date.now() + TOKEN_EXPIRY,
    iat: Date.now(),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payloadBase64)
    .digest('base64');

  return `${payloadBase64}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;

  try {
    const [payloadBase64, signature] = token.split('.');

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadBase64)
      .digest('base64');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    // Check expiry
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

function validateCredentials(email, password) {
  // Simple credential check
  // In production, hash password and compare with stored hash
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

function getTokenFromHeaders(headers) {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader) return null;

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return authHeader;
}

module.exports = {
  hashPassword,
  generateToken,
  verifyToken,
  validateCredentials,
  getTokenFromHeaders,
};
