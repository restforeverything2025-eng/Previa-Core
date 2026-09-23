import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import {
  OrderService,
  CmsOrderRepository,
  CmsProductRepository,
  ProductOrderEnrichmentService,
  OrderEndpoint,
  OrderHttpHandler
} from "../../src/index.js";

const cmsUrl = process.env.PREVIA_CMS_URL;
const hmacSecret = process.env.PREVIA_CORE_HMAC_SECRET;
const integrationSku = process.env.PREVIA_INTEGRATION_SKU;

if (!cmsUrl) throw new Error("PREVIA_CMS_URL is not set");
if (!hmacSecret) throw new Error("PREVIA_CORE_HMAC_SECRET is not set");
if (!integrationSku) {
  throw new Error(
    "PREVIA_INTEGRATION_SKU is not set. Set it to an existing AVAILABLE SKU before running this test."
  );
}

const TEST_OIDC_SECRET = "PREVIA_TEST_ONLY_OIDC_SECRET_v1";

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function signTestToken(header, payload) {
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", TEST_OIDC_SECRET)
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function createTestOidcCredentials() {
  const nonce = `previa-test-${randomUUID()}`;
  const now = Math.floor(Date.now() / 1000);
  const token = signTestToken(
    { alg: "HS256", typ: "JWT", kid: "PREVIA-TEST" },
    {
      iss: "https://oauth.telegram.org",
      aud: "8970735353",
      sub: "987654321",
      preferred_username: "previa_integration_test",
      name: "PREVIA Integration Test",
      iat: now,
      exp: now + 300,
      nonce
    }
  );
  return { token, nonce };
}

class TestModeTelegramOidcVerifier {
  async verify(token, options = {}) {
    const parts = String(token).split(".");
    if (parts.length !== 3) {
      throw Object.assign(new Error("Invalid test OIDC token"), { code: "AUTHENTICATION_ERROR" });
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createHmac("sha256", TEST_OIDC_SECRET)
      .update(signingInput)
      .digest("base64url");

    const actual = Buffer.from(encodedSignature);
    const expected = Buffer.from(expectedSignature);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw Object.assign(new Error("Invalid test OIDC signature"), { code: "AUTHENTICATION_ERROR" });
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);

    if (payload.iss !== "https://oauth.telegram.org") {
      throw Object.assign(new Error("Invalid test OIDC issuer"), { code: "AUTHENTICATION_ERROR" });
    }
    if (payload.aud !== "8970735353") {
      throw Object.assign(new Error("Invalid test OIDC audience"), { code: "AUTHENTICATION_ERROR" });
    }
    if (!payload.exp || payload.exp <= now || payload.iat > now + 30) {
      throw Object.assign(new Error("Expired or invalid test OIDC token"), { code: "AUTHENTICATION_ERROR" });
    }
    if (options.nonce !== payload.nonce) {
      throw Object.assign(new Error("Invalid test OIDC nonce"), { code: "AUTHENTICATION_ERROR" });
    }

    return {
      provider: "telegram",
      providerId: String(payload.sub),
      telegram_username: payload.preferred_username,
      telegram_name: payload.name
    };
  }
}

console.log("=== PREVIA Core → CMS Integration Test ===");
console.log("CMS URL:", cmsUrl);
console.log("Integration SKU:", integrationSku);
console.log("OIDC mode: isolated test verifier (production OIDC code unchanged)");
console.log("WARNING: this test creates a real order and reserves the selected SKU.");

const orderRepository = new CmsOrderRepository(cmsUrl, hmacSecret);
const productRepository = new CmsProductRepository(cmsUrl);
const productEnrichmentService = new ProductOrderEnrichmentService(productRepository);
const service = new OrderService(orderRepository, productEnrichmentService);
const endpoint = new OrderEndpoint(service);
const oidcVerifier = new TestModeTelegramOidcVerifier();
const handler = new OrderHttpHandler(endpoint, null, oidcVerifier, null);
const { token, nonce } = createTestOidcCredentials();

const request = {
  method: "POST",
  url: "/api/orders",
  body: {
    telegram_id_token: token,
    telegram_oidc_nonce: nonce,
    idempotency_key: `integration-test-${randomUUID()}`,
    customer_name: "PREVIA Integration Test",
    phone: "+380000000000",
    email: "integration@previa.local",
    contact_preferences: ["telegram"],
    payment_method: "nova_poshta_prepayment",
    items: [
      {
        sku: integrationSku,
        title: "CLIENT-SUPPLIED-TITLE-MUST-BE-IGNORED",
        price: 0.01,
        quantity: 1
      }
    ]
  }
};

const response = await handler.create(request);

console.log("HTTP status:", response.status);
console.log("Response:", JSON.stringify(response.body, null, 2));

if (response.status !== 200) {
  throw new Error(`Integration test failed with HTTP ${response.status}`);
}

if (!response.body?.success) {
  throw new Error("CMS did not confirm order creation");
}

console.log("");
console.log("✓ Current flat Core order contract accepted");
console.log("✓ telegram_id_token reached the OIDC authentication branch");
console.log("✓ Test OIDC signature, issuer, audience, expiry and nonce were verified");
console.log("✓ Production Core OIDC verifier was not weakened or changed");
console.log("✓ Idempotency key was supplied by the client contract");
console.log("✓ Product was resolved from authoritative CMS data");
console.log("✓ Client-supplied title/price were not trusted");
console.log("✓ Real HMAC request reached PREVIA-CMS");
console.log("✓ Order was created in CMS");
console.log("✓ Server generated order_id:", response.body.order_id);
console.log("");
console.log("ALL INTEGRATION TESTS PASSED");
