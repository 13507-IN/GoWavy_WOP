const jwt = require("jsonwebtoken");

const COOKIE_NAME = "gowavy_token";
const JWT_FALLBACK_SECRET = "change-this-jwt-secret-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getJwtSecret() {
  return process.env.JWT_SECRET || JWT_FALLBACK_SECRET;
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

module.exports = {
  COOKIE_NAME,
  signToken,
  verifyToken,
  getCookieOptions,
};
