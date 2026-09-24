/**
 * ============================================================
 * PREVIA Core
 * Web Session Token Utilities
 * ============================================================
 *
 * Stateless signed session token used after Telegram authentication.
 * The Telegram OIDC ID token is intentionally not reused for every
 * frontend request because it is short-lived.
 * ============================================================
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const SESSION_VERSION = "v1";
const DEFAULT_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signSessionPayload(encodedPayload, secret) {
  return createHmac("sha256", Buffer.from(String(secret || ""), "utf8"))
    .update(`${SESSION_VERSION}.${encodedPayload}`, "utf8")
    .digest("base64url");
}

function createSessionToken(customerId, secret, options = {}) {
  if (!customerId) {
    throw new Error("Customer ID is required for session token.");
  }

  if (!secret) {
    throw new Error("Session token secret is required.");
  }

  const nowSeconds = Number.isInteger(options.nowSeconds)
    ? options.nowSeconds
    : Math.floor(Date.now() / 1000);

  const ttlSeconds = Number.isInteger(options.ttlSeconds)
    ? options.ttlSeconds
    : DEFAULT_SESSION_TTL_SECONDS;

  if (ttlSeconds <= 0) {
    throw new Error("Session token TTL must be positive.");
  }

  const payload = JSON.stringify({
    v: 1,
    customerId: String(customerId),
    iat: nowSeconds,
    exp: nowSeconds + ttlSeconds,
    jti: randomBytes(16).toString("hex")
  });

  const encodedPayload = base64UrlEncode(payload);
  const signature = signSessionPayload(encodedPayload, secret);

  return `${SESSION_VERSION}.${encodedPayload}.${signature}`;
}

function verifySessionToken(token, secret, options = {}) {
  if (typeof token !== "string" || !token.trim()) {
    throw Object.assign(new Error("Web session token is required."), {
      code: "AUTHENTICATION_ERROR",
      retryable: false
    });
  }

  if (!secret) {
    throw Object.assign(new Error("Web session token secret is not configured."), {
      code: "INTERNAL_ERROR",
      retryable: false
    });
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== SESSION_VERSION) {
    throw Object.assign(new Error("Web session token is invalid."), {
      code: "AUTHENTICATION_ERROR",
      retryable: false
    });
  }

  const [, encodedPayload, providedSignature] = parts;
  const expectedSignature = signSessionPayload(encodedPayload, secret);
  const provided = Buffer.from(providedSignature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw Object.assign(new Error("Web session token signature is invalid."), {
      code: "AUTHENTICATION_ERROR",
      retryable: false
    });
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw Object.assign(new Error("Web session token payload is invalid."), {
      code: "AUTHENTICATION_ERROR",
      retryable: false
    });
  }

  const nowSeconds = Number.isInteger(options.nowSeconds)
    ? options.nowSeconds
    : Math.floor(Date.now() / 1000);

  if (
    payload?.v !== 1 ||
    typeof payload.customerId !== "string" ||
    !payload.customerId ||
    !Number.isInteger(payload.iat) ||
    !Number.isInteger(payload.exp) ||
    !payload.jti ||
    nowSeconds >= payload.exp
  ) {
    throw Object.assign(new Error("Web session token is expired or invalid."), {
      code: "AUTHENTICATION_ERROR",
      retryable: false
    });
  }

  return {
    customerId: payload.customerId,
    issuedAt: payload.iat,
    expiresAt: payload.exp,
    tokenId: payload.jti
  };
}

export {
  SESSION_VERSION,
  DEFAULT_SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken
};
