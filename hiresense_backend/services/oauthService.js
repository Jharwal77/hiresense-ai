import {
  createOAuthCode,
  findOAuthCodeByHash,
  consumeOAuthCode
} from "../models/mysql/oauthCodeModel.js";

import {
  generateOAuthCode,
  hashOAuthCode,
  getOAuthCodeExpiry
} from "../utils/oauthCode.js";

import { findUserById } from "../models/mysql/userModel.js";

import { createAuthTokens } from "./tokenService.js";

export async function createOAuthExchange({
  userId,
  role
}) {
  const code = generateOAuthCode();
  const codeHash = hashOAuthCode(code);
  const expiresAt = getOAuthCodeExpiry();

  await createOAuthCode({
    codeHash,
    userId,
    role,
    expiresAt
  });

  return code;
}

export async function exchangeOAuthCode(code) {
  if (
    typeof code !== "string" ||
    code.trim() === ""
  ) {
    const error = new Error(
      "OAuth code is required"
    );

    error.statusCode = 400;
    error.errorCode =
      "OAUTH_CODE_REQUIRED";

    throw error;
  }

  const codeHash = hashOAuthCode(
    code.trim()
  );

  const oauthCode =
    await findOAuthCodeByHash(codeHash);

  if (!oauthCode) {
    const error = new Error(
      "Invalid OAuth code"
    );

    error.statusCode = 401;
    error.errorCode =
      "INVALID_OAUTH_CODE";

    throw error;
  }

  if (oauthCode.used_at) {
    const error = new Error(
      "OAuth code has already been used"
    );

    error.statusCode = 401;
    error.errorCode =
      "OAUTH_CODE_ALREADY_USED";

    throw error;
  }

  if (
    new Date(oauthCode.expires_at) <=
    new Date()
  ) {
    const error = new Error(
      "OAuth code has expired"
    );

    error.statusCode = 401;
    error.errorCode =
      "OAUTH_CODE_EXPIRED";

    throw error;
  }

  const consumed =
    await consumeOAuthCode(
      oauthCode.id
    );

  if (!consumed) {
    const error = new Error(
      "OAuth code is invalid or has already been used"
    );

    error.statusCode = 401;
    error.errorCode =
      "OAUTH_CODE_INVALID";

    throw error;
  }

  const user =
    await findUserById(
      oauthCode.user_id
    );

  if (!user) {
    const error = new Error(
      "User not found"
    );

    error.statusCode = 404;
    error.errorCode =
      "USER_NOT_FOUND";

    throw error;
  }

  const {
    accessToken,
    refreshToken
  } = await createAuthTokens(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}