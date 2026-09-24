import assert from "node:assert/strict";

import {
  createSessionToken,
  verifySessionToken
} from "../../src/index.js";

const secret = "test-session-secret";
const token = createSessionToken("C000001", secret, {
  nowSeconds: 1000,
  ttlSeconds: 300
});

const session = verifySessionToken(token, secret, {
  nowSeconds: 1100
});

assert.equal(session.customerId, "C000001");
assert.equal(session.issuedAt, 1000);
assert.equal(session.expiresAt, 1300);

assert.throws(
  () => verifySessionToken(token, "wrong-secret", { nowSeconds: 1100 }),
  error => error.code === "AUTHENTICATION_ERROR"
);

assert.throws(
  () => verifySessionToken(token, secret, { nowSeconds: 1300 }),
  error => error.code === "AUTHENTICATION_ERROR"
);

console.log("Web session token test passed.");
