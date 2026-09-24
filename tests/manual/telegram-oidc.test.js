import assert from "node:assert/strict";
import { createSign, generateKeyPairSync } from "node:crypto";

import { TelegramOidcVerifier } from "../../src/index.js";

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = publicKey.export({ format: "jwk" });
const nowSeconds = 1_700_000_000;
const clientId = "8970735353";
const kid = "test-key-1";

const header = { alg: "RS256", typ: "JWT", kid };
const claims = {
  iss: "https://oauth.telegram.org",
  aud: clientId,
  sub: "oidc-subject-123456789",
  id: 123456789,
  iat: nowSeconds - 30,
  exp: nowSeconds + 300,
  nonce: "nonce-123",
  name: "Test User",
  preferred_username: "test_user"
};

const encodedHeader = base64UrlJson(header);
const encodedPayload = base64UrlJson(claims);
const signingInput = `${encodedHeader}.${encodedPayload}`;
const signer = createSign("RSA-SHA256");
signer.update(signingInput);
signer.end();
const signature = signer.sign(privateKey).toString("base64url");
const idToken = `${signingInput}.${signature}`;

const fetchImpl = async () => ({
  ok: true,
  async json() {
    return { keys: [{ ...publicJwk, kid, alg: "RS256", use: "sig" }] };
  }
});

const verifier = new TelegramOidcVerifier(clientId, { fetchImpl, maxAgeSeconds: 600 });
const identity = await verifier.verify(idToken, { nowSeconds, nonce: "nonce-123" });

assert.deepEqual(identity, {
  provider: "telegram",
  providerId: "123456789",
  telegram_username: "test_user",
  telegram_name: "Test User"
});

await assert.rejects(
  () => verifier.verify(idToken, { nowSeconds, nonce: "wrong" }),
  error => error.code === "AUTHENTICATION_ERROR"
);

await assert.rejects(
  () => verifier.verify(idToken, { nowSeconds: nowSeconds + 601, nonce: "nonce-123" }),
  error => error.code === "AUTHENTICATION_ERROR"
);

const badClaims = { ...claims, aud: "wrong-client" };
const badPayload = base64UrlJson(badClaims);
const badInput = `${encodedHeader}.${badPayload}`;
const badSigner = createSign("RSA-SHA256");
badSigner.update(badInput);
badSigner.end();
const badToken = `${badInput}.${badSigner.sign(privateKey).toString("base64url")}`;

await assert.rejects(
  () => verifier.verify(badToken, { nowSeconds }),
  error => error.code === "AUTHENTICATION_ERROR"
);

const missingTelegramIdClaims = { ...claims };
delete missingTelegramIdClaims.id;
const missingTelegramIdPayload = base64UrlJson(missingTelegramIdClaims);
const missingTelegramIdInput = `${encodedHeader}.${missingTelegramIdPayload}`;
const missingTelegramIdSigner = createSign("RSA-SHA256");
missingTelegramIdSigner.update(missingTelegramIdInput);
missingTelegramIdSigner.end();
const missingTelegramIdToken = `${missingTelegramIdInput}.${missingTelegramIdSigner.sign(privateKey).toString("base64url")}`;

await assert.rejects(
  () => verifier.verify(missingTelegramIdToken, { nowSeconds, nonce: "nonce-123" }),
  error => error.code === "AUTHENTICATION_ERROR"
);

console.log("Telegram OIDC verifier test passed.");
