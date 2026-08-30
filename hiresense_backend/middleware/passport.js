import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import env from "../config/env.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.google.clientId,
      clientSecret: env.google.clientSecret,
      callbackURL: env.google.callbackUrl,
      passReqToCallback: true
    },
    async (
      req,
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const email =
          profile.emails?.[0]?.value;

        if (!email) {
          const error = new Error(
            "Google account email is not available"
          );

          error.statusCode = 400;
          error.errorCode =
            "GOOGLE_EMAIL_NOT_AVAILABLE";

          return done(error);
        }

        const googleUser = {
          providerId: profile.id,
          name:
            profile.displayName ||
            profile.name?.givenName ||
            "Google User",
          email: email.toLowerCase()
        };

        return done(null, googleUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;