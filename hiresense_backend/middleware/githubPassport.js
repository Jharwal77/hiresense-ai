import passport from "passport";
import { Strategy as GitHubStrategy} from "passport-github2";

import env from "../config/env.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: env.github.clientId,
      clientSecret: env.github.clientSecret,
      callbackURL: env.github.callbackUrl
    },

    async (
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
            "GitHub account email is not available"
          );

          error.statusCode = 400;
          error.errorCode =
            "GITHUB_EMAIL_NOT_AVAILABLE";

          return done(error);
        }

        const githubUser = {
          providerId: profile.id,

          name:
            profile.displayName ||
            profile.username ||
            "GitHub User",

          email:
            email.trim().toLowerCase()
        };

        return done(
          null,
          githubUser
        );
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;