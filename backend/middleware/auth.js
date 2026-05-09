const { COOKIE_NAME, verifyToken } = require("../services/authToken");

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  if (req.cookies?.[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }

  return null;
}

function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please login to continue",
    });
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      provider: payload.provider,
    };
    return next();
  } catch {
    return res.status(401).json({
      error: "Invalid token",
      message: "Your session is invalid or expired. Please login again.",
    });
  }
}

module.exports = {
  extractToken,
  requireAuth,
};
