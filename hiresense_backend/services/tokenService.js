import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/jwt.js";

import { hashToken } from "../utils/token.js";

import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken
} from "../models/mysql/refreshTokenModel.js";

import {
  findUserById
} from "../models/mysql/userModel.js";

export async function createAuthTokens(user) {
  const payload = {
    userId: user.id,
    role: user.role
  };

  const accessToken =
    generateAccessToken(payload);

  const refreshToken =
    generateRefreshToken(payload);

  await saveRefreshToken(
    user.id,
    refreshToken
  );

  return {
    accessToken,
    refreshToken
  };
}

async function saveRefreshToken(
  userId,
  refreshToken
) {
  const refreshTokenHash =
    hashToken(refreshToken);

  const refreshTokenPayload =
    JSON.parse(
      Buffer.from(
        refreshToken.split(".")[1],
        "base64url"
      ).toString()
    );

  if (
    !refreshTokenPayload.exp ||
    !Number.isFinite(
      refreshTokenPayload.exp
    )
  ) {
    const error =
      new Error(
        "Invalid refresh token expiration"
      );

    error.statusCode = 500;
    error.errorCode =
      "INVALID_REFRESH_TOKEN_EXPIRATION";

    throw error;
  }

  const expiresAt =
    new Date(
      refreshTokenPayload.exp * 1000
    );

  await createRefreshToken({
    userId,
    tokenHash: refreshTokenHash,
    expiresAt
  });
}

export async function refreshAuthTokens(
  refreshToken
) {
  let payload;

  try {
    payload =
      verifyRefreshToken(refreshToken);
  } catch {
    const authError =
      new Error(
        "Invalid or expired refresh token"
      );

    authError.statusCode = 401;
    authError.errorCode =
      "INVALID_REFRESH_TOKEN";

    throw authError;
  }

  if (
    !payload ||
    !payload.userId ||
    !payload.role
  ) {
    const error =
      new Error(
        "Invalid refresh token"
      );

    error.statusCode = 401;
    error.errorCode =
      "INVALID_REFRESH_TOKEN";

    throw error;
  }

  const tokenHash =
    hashToken(refreshToken);

  const tokenRecord =
    await findRefreshTokenByHash(
      tokenHash
    );

  if (!tokenRecord) {
    const error =
      new Error(
        "Invalid refresh token"
      );

    error.statusCode = 401;
    error.errorCode =
      "INVALID_REFRESH_TOKEN";

    throw error;
  }

  if (tokenRecord.revoked_at) {
    const error =
      new Error(
        "Refresh token has been revoked"
      );

    error.statusCode = 401;
    error.errorCode =
      "REFRESH_TOKEN_REVOKED";

    throw error;
  }

  if (
    new Date(tokenRecord.expires_at)
      <= new Date()
  ) {
    const error =
      new Error(
        "Refresh token has expired"
      );

    error.statusCode = 401;
    error.errorCode =
      "REFRESH_TOKEN_EXPIRED";

    throw error;
  }

  if (
    Number(payload.userId) !==
    Number(tokenRecord.user_id)
  ) {
    const error =
      new Error(
        "Invalid refresh token"
      );

    error.statusCode = 401;
    error.errorCode =
      "INVALID_REFRESH_TOKEN";

    throw error;
  }

  const user =
    await findUserById(
      tokenRecord.user_id
    );

  if (!user) {
    const error =
      new Error(
        "User not found"
      );

    error.statusCode = 401;
    error.errorCode =
      "INVALID_REFRESH_TOKEN";

    throw error;
  }

  /*
   * Refresh-token rotation:
   *
   * The current refresh token becomes invalid
   * before a new token pair is issued.
   */
  const revoked =
    await revokeRefreshToken(
      tokenRecord.id
    );

  if (!revoked) {
    const error =
      new Error(
        "Refresh token has already been revoked"
      );

    error.statusCode = 401;
    error.errorCode =
      "REFRESH_TOKEN_REVOKED";

    throw error;
  }

  return createAuthTokens({
    id: user.id,
    role: user.role
  });
}

export async function logout(
  refreshToken
) {
  const tokenHash =
    hashToken(refreshToken);

  const tokenRecord =
    await findRefreshTokenByHash(
      tokenHash
    );

  if (!tokenRecord) {
    return;
  }

  if (tokenRecord.revoked_at) {
    return;
  }

  await revokeRefreshToken(
    tokenRecord.id
  );
}