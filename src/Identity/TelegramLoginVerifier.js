/**
 * ============================================================
 * PREVIA Core
 * Telegram Login Verifier
 * ============================================================
 *
 * Verifies Telegram Login Widget authorization data for the
 * standalone PREVIA website.
 *
 * The legacy Telegram Login Widget uses SHA256(bot_token) as the
 * HMAC secret. This verifier is intentionally separate from the
 * Mini App initData verifier because the two protocols use
 * different signing rules.
 * ============================================================
 */

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_LOGIN_MAX_AGE_SECONDS = 24 * 60 * 60;
const TELEGRAM_LOGIN_HASH_LENGTH = 64;

function authenticationError(message) {
  const error = new Error(message);
  error.code = "AUTHENTICATION_ERROR";
  error.retryable = false;
  return error;
}

function createTelegramLoginSecretKey(botToken) {
  return createHash("sha256")
    .update(botToken, "utf8")
    .digest();
}

function createTelegramLoginCheckString(data) {
  return Object.entries(data)
    .filter(([key, value]) => key !== "hash" && value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function safeHashEqual(receivedHash, expectedHash) {
  if (
    typeof receivedHash !== "string" ||
    typeof expectedHash !== "string" ||
    receivedHash.length !== TELEGRAM_LOGIN_HASH_LENGTH ||
    expectedHash.length !== TELEGRAM_LOGIN_HASH_LENGTH ||
    !/^[0-9a-fA-F]+$/.test(receivedHash) ||
    !/^[0-9a-fA-F]+$/.test(expectedHash)
  ) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(receivedHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}

class TelegramLoginVerifier {
  constructor(botToken, maxAgeSeconds = DEFAULT_LOGIN_MAX_AGE_SECONDS) {
    if (typeof botToken !== "string" || !botToken.trim()) {
      throw new Error("Telegram bot token is required.");
    }

    if (!Number.isInteger(maxAgeSeconds) || maxAgeSeconds <= 0) {
      throw new Error("Telegram login max age must be a positive integer.");
    }

    this.botToken = botToken;
    this.maxAgeSeconds = maxAgeSeconds;
  }

  verify(data, nowSeconds = Math.floor(Date.now() / 1000)) {
    if (!data || typeof data !== "object") {
      throw authenticationError("Telegram login data is required.");
    }

    if (data.id === undefined || data.auth_date === undefined || !data.hash) {
      throw authenticationError("Telegram login data is missing required fields.");
    }

    const authDate = Number(data.auth_date);
    if (!Number.isInteger(authDate)) {
      throw authenticationError("Telegram auth_date is invalid.");
    }

    const age = nowSeconds - authDate;
    if (age < 0 || age > this.maxAgeSeconds) {
      throw authenticationError("Telegram login data has expired or is not yet valid.");
    }

    const dataCheckString = createTelegramLoginCheckString(data);
    const secretKey = createTelegramLoginSecretKey(this.botToken);
    const expectedHash = createHmac("sha256", secretKey)
      .update(dataCheckString, "utf8")
      .digest("hex");

    if (!safeHashEqual(String(data.hash), expectedHash)) {
      throw authenticationError("Telegram login signature is invalid.");
    }

    const telegramName = [data.first_name, data.last_name]
      .filter(Boolean)
      .map(String)
      .join(" ")
      .trim();

    return {
      provider: "telegram",
      providerId: String(data.id),
      telegram_username: data.username ? String(data.username) : "",
      telegram_name: telegramName || String(data.id)
    };
  }
}

export {
  TelegramLoginVerifier,
  DEFAULT_LOGIN_MAX_AGE_SECONDS
};
