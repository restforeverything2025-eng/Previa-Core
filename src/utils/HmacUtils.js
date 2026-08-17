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

import { createHmac, randomBytes } from "crypto";

/**
 * Generates a cryptographically secure random nonce.
 *
 * @returns {string} 64-character hex string
 */
function generateNonce() {
  return randomBytes(32).toString("hex");
}

/**
 * Generates HMAC-SHA256 signature for a message.
 *
 * Message format:
 * "v1\naction\ntimestamp\nnonce\npayload"
 *
 * @param {string} action
 * @param {string} timestamp
 * @param {string} nonce
 * @param {string} payloadString
 * @param {string} secret
 * @returns {string} Hexadecimal HMAC-SHA256 signature
 */
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

/**
 * Creates a complete HMAC envelope for CMS communication.
 *
 * @param {string} action
 * @param {Object} payload
 * @param {string} secret
 * @returns {Object}
 */
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
  createHmacEnvelope
};