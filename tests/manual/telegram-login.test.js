import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";

import { TelegramLoginVerifier } from "../../src/index.js";

function buildAuthorization(botToken, data) {
  const dataCheckString = Object.entries(data)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHash("sha256")
    .update(botToken, "utf8")
    .digest();

  const hash = createHmac("sha256", secretKey)
    .update(dataCheckString, "utf8")
    .digest("hex");

  return { ...data, hash };
}

const botToken = "test-bot-token";
const nowSeconds = 1_700_000_000;

const authorization = buildAuthorization(botToken, {
  id: "123456",
  first_name: "Test",
  last_name: "User",
  username: "test_user",
  auth_date: String(nowSeconds - 30)
});

const verifier = new TelegramLoginVerifier(botToken, 300);
const identity = verifier.verify(authorization, nowSeconds);

assert.deepEqual(identity, {
  provider: "telegram",
  providerId: "123456",
  telegram_username: "test_user",
  telegram_name: "Test User"
});

assert.throws(
  () => verifier.verify({ ...authorization, hash: "0".repeat(64) }, nowSeconds),
  error => error.code === "AUTHENTICATION_ERROR"
);

assert.throws(
  () => verifier.verify(authorization, nowSeconds + 301),
  error => error.code === "AUTHENTICATION_ERROR"
);

console.log("Telegram login verifier test passed.");
