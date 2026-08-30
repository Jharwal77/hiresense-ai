import express from "express";
import passport from "../middleware/passport.js";

import {
  register,
  login,
  refresh,
  logout,
  getMe,
  googleCallback,
  githubCallback,
  exchangeOAuth
} from "../controllers/authController.js";

import { authenticate } from "../middleware/authenticate.js";

import {
  createOAuthState
} from "../utils/oauthState.js";

const router = express.Router();

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.post(
  "/refresh",
  refresh
);

router.post(
  "/logout",
  logout
);

router.get(
  "/google",
  (req, res, next) => {
    try {
      const { role } = req.query;

      const state =
        createOAuthState(role);

      return passport.authenticate(
        "google",
        {
          scope: [
            "profile",
            "email"
          ],
          session: false,
          state
        }
      )(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/google/callback",
  passport.authenticate(
    "google",
    {
      session: false,
      failureRedirect:
        "/api/auth/google/failure"
    }
  ),
  googleCallback
);

router.get(
  "/google/failure",
  (req, res) => {
    return res.status(401).json({
      success: false,
      message:
        "Google authentication failed",
      errorCode:
        "GOOGLE_AUTH_FAILED"
    });
  }
);

router.get(
  "/github",
  (req, res, next) => {
    try {
      const { role } = req.query;

      const state =
        createOAuthState(role);

      return passport.authenticate(
        "github",
        {
          scope: [
            "user:email"
          ],
          session: false,
          state
        }
      )(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/github/callback",
  passport.authenticate(
    "github",
    {
      session: false,
      failureRedirect:
        "/api/auth/github/failure"
    }
  ),
  githubCallback
);

router.get(
  "/github/failure",
  (req, res) => {
    return res.status(401).json({
      success: false,
      message:
        "GitHub authentication failed",
      errorCode:
        "GITHUB_AUTH_FAILED"
    });
  }
);

router.post(
  "/oauth/exchange",
  exchangeOAuth
);

router.get(
  "/me",
  authenticate,
  getMe
);

export default router;