import crypto from "crypto";

const OAUTH_CODE_MAX_AGE = 60 * 1000;

export function generateOAuthCode() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashOAuthCode(code) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

export function getOAuthCodeExpiry() {
  return new Date(
    Date.now() + OAUTH_CODE_MAX_AGE
  );
}