import env from "../config/env.js";

import {
  registerUser,
  loginUser
} from "../services/authService.js";

import {
  authenticateSocialUser
} from "../services/socialAuthService.js";

import {
  findUserById
} from "../models/mysql/userModel.js";

import {
  refreshAuthTokens,
  logout as logoutUser
} from "../services/tokenService.js";

import {
  registerSchema,
  loginSchema
} from "../validators/authValidator.js";

import {
  verifyOAuthState
} from "../utils/oauthState.js";

import {
  createOAuthExchange,
  exchangeOAuthCode
} from "../services/oauthService.js";

export async function register(req, res, next) {
  try {
    const result =
      registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        errors: result.error.issues.map(
          (issue) => ({
            field: issue.path.join("."),
            message: issue.message
          })
        )
      });
    }

    const user =
      await registerUser(result.data);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result =
      loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errorCode: "VALIDATION_ERROR",
        errors: result.error.issues.map(
          (issue) => ({
            field: issue.path.join("."),
            message: issue.message
          })
        )
      });
    }

    const resultData =
      await loginUser(result.data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: resultData.user,
        accessToken:
          resultData.accessToken,
        refreshToken:
          resultData.refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function googleCallback(
  req,
  res,
  next
) {
  try {
    if (!req.user) {
      const error = new Error(
        "Google authentication failed"
      );

      error.statusCode = 401;
      error.errorCode =
        "GOOGLE_AUTH_FAILED";

      throw error;
    }

    const state =
      req.query.state;

    const { role } =
      verifyOAuthState(state);

    const result =
      await authenticateSocialUser({
        authProvider: "google",
        providerId:
          req.user.providerId,
        name:
          req.user.name,
        email:
          req.user.email,
        role
      });

    const code =
      await createOAuthExchange({
        userId: result.user.id,
        role: result.user.role
      });

    return res.redirect(
      `${env.clientUrl}/oauth/callback?code=${encodeURIComponent(code)}`
    );
  } catch (error) {
    next(error);
  }
}

export async function githubCallback(
  req,
  res,
  next
) {
  try {
    if (!req.user) {
      const error = new Error(
        "GitHub authentication failed"
      );

      error.statusCode = 401;
      error.errorCode =
        "GITHUB_AUTH_FAILED";

      throw error;
    }

    const state =
      req.query.state;

    const { role } =
      verifyOAuthState(state);

    const result =
      await authenticateSocialUser({
        authProvider: "github",
        providerId:
          req.user.providerId,
        name:
          req.user.name,
        email:
          req.user.email,
        role
      });

    const code =
      await createOAuthExchange({
        userId: result.user.id,
        role: result.user.role
      });

    return res.redirect(
      `${env.clientUrl}/oauth/callback?code=${encodeURIComponent(code)}`
    );
  } catch (error) {
    next(error);
  }
}

export async function exchangeOAuth(
  req,
  res,
  next
) {
  try {
    const { code } = req.body;

    const result =
      await exchangeOAuthCode(code);

    return res.status(200).json({
      success: true,
      message:
        "OAuth authentication successful",
      data: {
        user: result.user,
        accessToken:
          result.accessToken,
        refreshToken:
          result.refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } =
      req.body;

    if (
      typeof refreshToken !== "string" ||
      refreshToken.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Refresh token is required",
        errorCode:
          "REFRESH_TOKEN_REQUIRED"
      });
    }

    const tokens =
      await refreshAuthTokens(
        refreshToken.trim()
      );

    return res.status(200).json({
      success: true,
      message:
        "Token refreshed successfully",
      data: {
        accessToken:
          tokens.accessToken,
        refreshToken:
          tokens.refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } =
      req.body;

    if (
      typeof refreshToken !== "string" ||
      refreshToken.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Refresh token is required",
        errorCode:
          "REFRESH_TOKEN_REQUIRED"
      });
    }

    await logoutUser(
      refreshToken.trim()
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user =
      await findUserById(
        req.user.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        errorCode:
          "USER_NOT_FOUND"
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Current user retrieved successfully",
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
}