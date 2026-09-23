/**
 * PREVIA Core - Telegram OIDC ID Token Verifier
 * Verifies Telegram Login OIDC ID tokens server-side.
 */

import { createPublicKey, createVerify, timingSafeEqual } from "node:crypto";

const DEFAULT_ISSUER = "https://oauth.telegram.org";
const DEFAULT_JWKS_URL = "https://oauth.telegram.org/.well-known/jwks.json";
const DEFAULT_MAX_AGE_SECONDS = 10 * 60;
const DEFAULT_CLOCK_SKEW_SECONDS = 30;
const SUPPORTED_ALGORITHM = "RS256";

function authenticationError(message) {
  const error = new Error(message);
  error.code = "AUTHENTICATION_ERROR";
  error.retryable = false;
  return error;
}

function decodeJson(value, label) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw authenticationError(`Telegram ID token ${label} is invalid.`);
  }
}

function safeStringEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

function audienceMatches(audience, clientId) {
  if (typeof audience === "string") return safeStringEqual(audience, clientId);
  if (Array.isArray(audience)) return audience.some(value => typeof value === "string" && safeStringEqual(value, clientId));
  return false;
}

function normalizeIdentity(claims) {
  if (claims.sub === undefined || claims.sub === null) {
    throw authenticationError("Telegram ID token subject is missing.");
  }
  const name = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(" ") || String(claims.sub);
  return {
    provider: "telegram",
    providerId: String(claims.sub),
    telegram_username: claims.preferred_username ? String(claims.preferred_username) : "",
    telegram_name: String(name)
  };
}

class TelegramOidcVerifier {
  constructor(clientId, options = {}) {
    if (clientId === undefined || clientId === null || String(clientId).trim() === "") {
      throw new Error("Telegram OIDC client ID is required.");
    }
    const {
      issuer = DEFAULT_ISSUER,
      jwksUrl = DEFAULT_JWKS_URL,
      fetchImpl = globalThis.fetch,
      maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS,
      clockSkewSeconds = DEFAULT_CLOCK_SKEW_SECONDS
    } = options;
    if (typeof fetchImpl !== "function") throw new Error("A fetch implementation is required for Telegram OIDC verification.");
    if (!Number.isInteger(maxAgeSeconds) || maxAgeSeconds <= 0) throw new Error("Telegram OIDC max age must be a positive integer.");
    if (!Number.isInteger(clockSkewSeconds) || clockSkewSeconds < 0) throw new Error("Telegram OIDC clock skew must be a non-negative integer.");
    this.clientId = String(clientId);
    this.issuer = issuer;
    this.jwksUrl = jwksUrl;
    this.fetchImpl = fetchImpl;
    this.maxAgeSeconds = maxAgeSeconds;
    this.clockSkewSeconds = clockSkewSeconds;
    this.jwksCache = null;
  }

  async verify(idToken, options = {}) {
    if (typeof idToken !== "string" || !idToken.trim()) throw authenticationError("Telegram ID token is required.");
    const parts = idToken.split(".");
    if (parts.length !== 3) throw authenticationError("Telegram ID token is malformed.");
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = decodeJson(encodedHeader, "header");
    const claims = decodeJson(encodedPayload, "payload");
    if (header.alg !== SUPPORTED_ALGORITHM) throw authenticationError(`Unsupported Telegram ID token algorithm: ${header.alg || "missing"}.`);
    if (!header.kid) throw authenticationError("Telegram ID token key id is missing.");
    if (!safeStringEqual(String(claims.iss || ""), this.issuer)) throw authenticationError("Telegram ID token issuer is invalid.");
    if (!audienceMatches(claims.aud, this.clientId)) throw authenticationError("Telegram ID token audience is invalid.");
    if (Array.isArray(claims.aud) && claims.aud.length > 1 && claims.azp !== undefined && !safeStringEqual(String(claims.azp), this.clientId)) throw authenticationError("Telegram ID token authorized party is invalid.");

    const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
    const exp = Number(claims.exp);
    const iat = Number(claims.iat);
    if (!Number.isInteger(exp) || nowSeconds - this.clockSkewSeconds >= exp) throw authenticationError("Telegram ID token has expired.");
    if (!Number.isInteger(iat) || iat > nowSeconds + this.clockSkewSeconds) throw authenticationError("Telegram ID token issued-at time is invalid.");
    if (nowSeconds - iat > this.maxAgeSeconds + this.clockSkewSeconds) throw authenticationError("Telegram ID token is too old.");
    if (options.nonce !== undefined && (!claims.nonce || !safeStringEqual(String(claims.nonce), String(options.nonce)))) throw authenticationError("Telegram ID token nonce is invalid.");

    const key = await this._getSigningKey(header.kid);
    const publicKey = createPublicKey({ key, format: "jwk" });
    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${encodedHeader}.${encodedPayload}`);
    verifier.end();
    let signature;
    try { signature = Buffer.from(encodedSignature, "base64url"); } catch { throw authenticationError("Telegram ID token signature is malformed."); }
    if (!verifier.verify(publicKey, signature)) throw authenticationError("Telegram ID token signature is invalid.");
    return normalizeIdentity(claims);
  }

  async _getSigningKey(kid) {
    let jwks = await this._loadJwks(false);
    let key = jwks.keys?.find(candidate => candidate.kid === kid);
    if (!key) {
      jwks = await this._loadJwks(true);
      key = jwks.keys?.find(candidate => candidate.kid === kid);
    }
    if (!key || key.kty !== "RSA" || !key.n || !key.e) throw authenticationError("Telegram ID token signing key is unavailable.");
    return key;
  }

  async _loadJwks(forceRefresh) {
    if (!forceRefresh && this.jwksCache) return this.jwksCache;
    let response;
    try {
      response = await this.fetchImpl(this.jwksUrl, { headers: { Accept: "application/json" } });
    } catch {
      throw Object.assign(new Error("Telegram signing keys could not be loaded."), { code: "AUTHENTICATION_ERROR", retryable: true });
    }
    if (!response?.ok) throw Object.assign(new Error("Telegram signing keys could not be loaded."), { code: "AUTHENTICATION_ERROR", retryable: true });
    let jwks;
    try { jwks = await response.json(); } catch { throw Object.assign(new Error("Telegram signing keys response is invalid."), { code: "AUTHENTICATION_ERROR", retryable: true }); }
    if (!jwks || !Array.isArray(jwks.keys)) throw Object.assign(new Error("Telegram signing keys response is invalid."), { code: "AUTHENTICATION_ERROR", retryable: true });
    this.jwksCache = jwks;
    return jwks;
  }
}

export { TelegramOidcVerifier, DEFAULT_ISSUER, DEFAULT_JWKS_URL, DEFAULT_MAX_AGE_SECONDS, DEFAULT_CLOCK_SKEW_SECONDS };
