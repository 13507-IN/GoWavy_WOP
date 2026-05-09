const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { upsertGoogleUser } = require("../services/userStore");

let configured = false;

function configurePassport() {
  if (configured) return;

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    configured = true;
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:5000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const avatar = profile.photos?.[0]?.value || null;

          const user = await upsertGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar,
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  configured = true;
}

module.exports = { configurePassport };
