require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001", 
      "https://go-wavy-wop.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());

// Routes
const tripRoutes = require("./routes/trip");
app.use("/api/trip", tripRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "GoWavy Backend",
    timestamp: new Date().toISOString(),
    keys: {
      gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here",
      googleMaps: !!process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== "your_google_maps_api_key_here",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🌊 GoWavy Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.warn("   ⚠️  GEMINI_API_KEY not set in .env");
  }
  if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY === "your_google_maps_api_key_here") {
    console.warn("   ⚠️  GOOGLE_MAPS_API_KEY not set in .env");
  }
  console.log("");
});
