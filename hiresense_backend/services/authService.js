import {
  createUser,
  findUserByEmail
} from "../models/mysql/userModel.js";

import {
  hashPassword,
  comparePassword
} from "../utils/password.js";

import { createAuthTokens } from "./tokenService.js";

export async function registerUser({
  name,
  email,
  password,
  role
}) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists"
    );

    error.statusCode = 409;
    error.errorCode = "EMAIL_ALREADY_EXISTS";

    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser({
    name,
    email,
    passwordHash,
    role
  });

  return user;
}

export async function loginUser({
  email,
  password
}) {
  const user = await findUserByEmail(email);

  if (!user) {
    const error = new Error("Invalid email or password");

    error.statusCode = 401;
    error.errorCode = "INVALID_CREDENTIALS";

    throw error;
  }

  const passwordValid = await comparePassword(
    password,
    user.password_hash
  );

  if (!passwordValid) {
    const error = new Error("Invalid email or password");

    error.statusCode = 401;
    error.errorCode = "INVALID_CREDENTIALS";

    throw error;
  }

  const { accessToken, refreshToken } =
    await createAuthTokens(user);

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