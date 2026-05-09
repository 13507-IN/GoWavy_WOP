require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { configurePassport } = require("./config/passport");
const { requireAuth } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://go-wavy-wop.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
configurePassport();

const tripRoutes = require("./routes/trip");
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
app.use("/api/trip", requireAuth, tripRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "GoWavy Backend",
    timestamp: new Date().toISOString(),
    keys: {
      gemini:
        !!process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== "your_gemini_api_key_here",
      googleMaps:
        !!process.env.GOOGLE_MAPS_API_KEY &&
        process.env.GOOGLE_MAPS_API_KEY !== "your_google_maps_api_key_here",
      googleOAuth: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      jwt: !!process.env.JWT_SECRET,
    },
  });
});

app.listen(PORT, () => {
  console.log(`\nGoWavy Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log("   Auth: Local JWT + Google OAuth enabled");

  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY === "your_gemini_api_key_here"
  ) {
    console.warn("   WARNING: GEMINI_API_KEY not set in .env");
  }
  if (
    !process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY === "your_google_maps_api_key_here"
  ) {
    console.warn("   WARNING: GOOGLE_MAPS_API_KEY not set in .env");
  }
  if (!process.env.JWT_SECRET) {
    console.warn("   WARNING: JWT_SECRET not set, using an insecure fallback secret");
  }
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("   WARNING: Google OAuth keys missing; /api/auth/google will be unavailable");
  }
  console.log("");
});
