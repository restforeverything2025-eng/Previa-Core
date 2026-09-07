import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

import {
  TelegramIdentityVerifier
} from "../../src/index.js";

const BOT_TOKEN = "123456:TEST_BOT_TOKEN";
const AUTH_DATE = 1770000000;
const NOW = AUTH_DATE + 60;

function buildInitData(overrides = {}) {
  const user = overrides.user || {
    id: 123456789,
    first_name: "Yurii",
    last_name: "PREVIA",
    username: "previa_test"
  };

  const params = new URLSearchParams({
    auth_date: String(overrides.auth_date ?? AUTH_DATE),
    query_id: "AAH_TEST_QUERY_ID",
    user: JSON.stringify(user)
  });

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  const hash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  params.set("hash", hash);

  return params.toString();
}

const verifier = new TelegramIdentityVerifier(BOT_TOKEN);
const initData = buildInitData();
const identity = verifier.verify(initData, NOW);

assert.deepEqual(identity, {
  provider: "telegram",
  providerId: "123456789",
  telegram_username: "previa_test",
  telegram_name: "Yurii PREVIA"
});

assert.throws(
  () => verifier.verify(`${initData.slice(0, -1)}0`, NOW),
  error => error.code === "AUTHENTICATION_ERROR"
);

assert.throws(
  () => verifier.verify(buildInitData({ auth_date: AUTH_DATE - 86401 }), NOW),
  error => error.code === "AUTHENTICATION_ERROR"
);

assert.throws(
  () => verifier.verify("", NOW),
  error => error.code === "AUTHENTICATION_ERROR"
);

console.log("✓ Telegram initData signature verified");
console.log("✓ Telegram identity normalized");
console.log("✓ Invalid signature rejected");
console.log("✓ Expired initData rejected");
console.log("✓ Missing initData rejected");
console.log("ALL TELEGRAM IDENTITY TESTS PASSED");
