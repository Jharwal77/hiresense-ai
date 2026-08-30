import crypto from "crypto";
import env from "../config/env.js";

const STATE_MAX_AGE = 10 * 60 * 1000;

function getSecret() {
  if (!env.jwt.accessSecret) {
    throw new Error(
      "JWT access secret is required for OAuth state"
    );
  }

  return env.jwt.accessSecret;
}

export function createOAuthState(role) {
  if (
    role !== "candidate" &&
    role !== "employer"
  ) {
    const error = new Error(
      "Invalid OAuth role"
    );

    error.statusCode = 400;
    error.errorCode = "INVALID_OAUTH_ROLE";

    throw error;
  }

  const timestamp = Date.now();

  const payload = `${role}.${timestamp}`;

  const signature =
    crypto
      .createHmac(
        "sha256",
        getSecret()
      )
      .update(payload)
      .digest("hex");

  return `${payload}.${signature}`;
}

export function verifyOAuthState(state) {
  if (
    typeof state !== "string" ||
    state.trim() === ""
  ) {
    const error = new Error(
      "OAuth state is required"
    );

    error.statusCode = 400;
    error.errorCode =
      "OAUTH_STATE_REQUIRED";

    throw error;
  }

  const parts = state.split(".");

  if (parts.length !== 3) {
    const error = new Error(
      "Invalid OAuth state"
    );

    error.statusCode = 400;
    error.errorCode =
      "INVALID_OAUTH_STATE";

    throw error;
  }

  const [
    role,
    timestamp,
    signature
  ] = parts;

  if (
    role !== "candidate" &&
    role !== "employer"
  ) {
    const error = new Error(
      "Invalid OAuth role"
    );

    error.statusCode = 400;
    error.errorCode =
      "INVALID_OAUTH_ROLE";

    throw error;
  }

  const parsedTimestamp =
    Number(timestamp);

  if (
    !Number.isFinite(parsedTimestamp)
  ) {
    const error = new Error(
      "Invalid OAuth state timestamp"
    );

    error.statusCode = 400;
    error.errorCode =
      "INVALID_OAUTH_STATE";

    throw error;
  }

  const age =
    Date.now() - parsedTimestamp;

  if (
    age < 0 ||
    age > STATE_MAX_AGE
  ) {
    const error = new Error(
      "OAuth state has expired"
    );

    error.statusCode = 400;
    error.errorCode =
      "OAUTH_STATE_EXPIRED";

    throw error;
  }

  const payload =
    `${role}.${timestamp}`;

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        getSecret()
      )
      .update(payload)
      .digest("hex");

  if (
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    const error = new Error(
      "Invalid OAuth state signature"
    );

    error.statusCode = 400;
    error.errorCode =
      "INVALID_OAUTH_STATE";

    throw error;
  }

  const validSignature =
    crypto.timingSafeEqual(
      Buffer.from(
        signature,
        "hex"
      ),
      Buffer.from(
        expectedSignature,
        "hex"
      )
    );

  if (!validSignature) {
    const error = new Error(
      "Invalid OAuth state signature"
    );

    error.statusCode = 400;
    error.errorCode =
      "INVALID_OAUTH_STATE";

    throw error;
  }

  return {
    role
  };
}