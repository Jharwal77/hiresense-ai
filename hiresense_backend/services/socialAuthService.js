import {
  findUserByEmail,
  findUserByProvider,
  createSocialUser
} from "../models/mysql/userModel.js";

import { createAuthTokens } from "./tokenService.js";

export async function authenticateSocialUser({
  authProvider,
  providerId,
  name,
  email,
  role
}) {
  if (
    !authProvider ||
    !providerId ||
    !email
  ) {
    const error = new Error(
      "Social authentication information is incomplete"
    );

    error.statusCode = 400;
    error.errorCode =
      "SOCIAL_AUTH_DATA_REQUIRED";

    throw error;
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const existingProviderUser =
    await findUserByProvider({
      authProvider,
      providerId
    });

  if (existingProviderUser) {
    if (!existingProviderUser.role) {
      const error = new Error(
        "User role is not configured"
      );

      error.statusCode = 400;
      error.errorCode =
        "USER_ROLE_NOT_CONFIGURED";

      throw error;
    }

    const {
      accessToken,
      refreshToken
    } = await createAuthTokens(
      existingProviderUser
    );

    return {
      user: {
        id: existingProviderUser.id,
        name: existingProviderUser.name,
        email: existingProviderUser.email,
        role: existingProviderUser.role
      },
      accessToken,
      refreshToken,
      isNewUser: false
    };
  }

  const existingEmailUser =
    await findUserByEmail(normalizedEmail);

  if (existingEmailUser) {
    if (
      existingEmailUser.auth_provider ===
      "local"
    ) {
      const error = new Error(
        "An account with this email already exists. Please log in using email and password."
      );

      error.statusCode = 409;
      error.errorCode =
        "EMAIL_ACCOUNT_ALREADY_EXISTS";

      throw error;
    }

    if (
      existingEmailUser.auth_provider !==
      authProvider
    ) {
      const error = new Error(
        `This email is already associated with ${existingEmailUser.auth_provider} authentication`
      );

      error.statusCode = 409;
      error.errorCode =
        "AUTH_PROVIDER_CONFLICT";

      throw error;
    }

    const error = new Error(
      "Social authentication account conflict"
    );

    error.statusCode = 409;
    error.errorCode =
      "SOCIAL_ACCOUNT_CONFLICT";

    throw error;
  }

  if (
    role !== "candidate" &&
    role !== "employer"
  ) {
    const error = new Error(
      "A valid role is required for social registration"
    );

    error.statusCode = 400;
    error.errorCode = "INVALID_ROLE";

    throw error;
  }

  const user =
    await createSocialUser({
      name:
        name?.trim() || "User",
      email: normalizedEmail,
      role,
      authProvider,
      providerId
    });

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
    refreshToken,
    isNewUser: true
  };
}