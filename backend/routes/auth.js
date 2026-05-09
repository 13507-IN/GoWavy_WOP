const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { extractToken, requireAuth } = require("../middleware/auth");
const { COOKIE_NAME, signToken, getCookieOptions } = require("../services/authToken");
const {
  createLocalUser,
  findUserByEmail,
  findUserById,
  publicUser,
} = require("../services/userStore");

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

function canUseGoogleAuth() {
  return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
}

function issueAuthResponse(res, user, statusCode = 200) {
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return res.status(statusCode).json({
    user: publicUser(user),
    token,
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await createLocalUser({ name, email, passwordHash });

    return issueAuthResponse(res, user, 201);
  } catch (error) {
    if (error.code === "USER_EXISTS") {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    return res.status(500).json({ message: "Failed to register" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(String(password), user.passwordHash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return issueAuthResponse(res, user);
  } catch {
    return res.status(500).json({ message: "Failed to login" });
  }
});

router.get("/google", (req, res, next) => {
  if (!canUseGoogleAuth()) {
    return res.status(503).json({ message: "Google authentication is not configured" });
  }

  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!canUseGoogleAuth()) {
      return res.redirect(`${FRONTEND_URL}/?auth=google_not_configured`);
    }

    return passport.authenticate("google", {
      session: false,
      failureRedirect: `${FRONTEND_URL}/?auth=google_failed`,
    })(req, res, next);
  },
  (req, res) => {
    const token = signToken(req.user);
    res.cookie(COOKIE_NAME, token, getCookieOptions());
    return res.redirect(`${FRONTEND_URL}/planner?auth=google_success`);
  }
);

router.get("/me", requireAuth, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: publicUser(user) });
});

router.post("/logout", (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.json({ success: true });
  }

  res.clearCookie(COOKIE_NAME, {
    ...getCookieOptions(),
    maxAge: 0,
  });
  return res.json({ success: true });
});

module.exports = router;
