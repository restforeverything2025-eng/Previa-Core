/**
 * ============================================================
 * PREVIA Core
 * HMAC Utilities
 * ============================================================
 *
 * Generates HMAC-SHA256 signatures for Core → CMS communication.
 * Implements v1 envelope format per CMS contract.
 *
 * ============================================================
 */

import { createHash, createHmac, randomBytes } from "crypto";

function generateNonce() {
  return randomBytes(32).toString("hex");
}

function signingStringFingerprint(value) {
  return createHash("sha256")
    .update(String(value || ""), "utf8")
    .digest("hex")
    .slice(0, 16);
}

function generateHmacSignature(
  action,
  timestamp,
  nonce,
  payloadString,
  secret
) {
  const message =
    `v1\n${action}\n${timestamp}\n${nonce}\n${payloadString}`;

  const hmac = createHmac("sha256", secret);
  hmac.update(message);

  return hmac.digest("hex");
}

function createHmacEnvelope(action, payload, secret) {
  const timestamp = new Date().toISOString();
  const nonce = generateNonce();
  const payloadString = JSON.stringify(payload);

  const signature = generateHmacSignature(
    action,
    timestamp,
    nonce,
    payloadString,
    secret
  );

  return {
    action,
    payload: payloadString,
    auth: {
      version: "v1",
      key_id: "core-v1",
      timestamp,
      nonce,
      signature
    }
  };
}

export {
  generateNonce,
  generateHmacSignature,
  createHmacEnvelope,
  signingStringFingerprint
};