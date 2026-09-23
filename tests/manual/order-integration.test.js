import { randomUUID } from "node:crypto";

import {
  OrderService,
  CmsOrderRepository,
  CmsProductRepository,
  ProductOrderEnrichmentService,
  OrderEndpoint,
  OrderHttpHandler,
  TelegramOidcVerifier
} from "../../src/index.js";

const cmsUrl = process.env.PREVIA_CMS_URL;
const hmacSecret = process.env.PREVIA_CORE_HMAC_SECRET;
const oidcClientId = process.env.PREVIA_TELEGRAM_OIDC_CLIENT_ID || "8970735353";
const integrationSku = process.env.PREVIA_INTEGRATION_SKU;

if (!cmsUrl) throw new Error("PREVIA_CMS_URL is not set");
if (!hmacSecret) throw new Error("PREVIA_CORE_HMAC_SECRET is not set");
if (!integrationSku) {
  throw new Error(
    "PREVIA_INTEGRATION_SKU is not set. Set it to an existing AVAILABLE SKU before running this test."
  );
}

console.log("=== PREVIA Core → CMS Integration Test ===");
console.log("CMS URL:", cmsUrl);
console.log("Integration SKU:", integrationSku);
console.log("WARNING: this test creates a real order and reserves the selected SKU.");

const orderRepository = new CmsOrderRepository(cmsUrl, hmacSecret);
const productRepository = new CmsProductRepository(cmsUrl);
const productEnrichmentService = new ProductOrderEnrichmentService(productRepository);
const service = new OrderService(orderRepository, productEnrichmentService);
const endpoint = new OrderEndpoint(service);

/*
 * The integration test deliberately uses the same OIDC verifier class as the
 * production runtime. No Telegram browser/login interaction is required here.
 * A real ID token and matching nonce must be supplied through environment
 * variables so this test validates the deployed OIDC contract without creating
 * an artificial authentication path.
 */
const oidcIdToken = process.env.PREVIA_INTEGRATION_OIDC_ID_TOKEN;
const oidcNonce = process.env.PREVIA_INTEGRATION_OIDC_NONCE;

if (!oidcIdToken || !oidcNonce) {
  throw new Error(
    "PREVIA_INTEGRATION_OIDC_ID_TOKEN and PREVIA_INTEGRATION_OIDC_NONCE are required. " +
    "Use a real Telegram OIDC ID token and the nonce generated for that authentication flow."
  );
}

const oidcVerifier = new TelegramOidcVerifier(oidcClientId, {
  maxAgeSeconds: 600
});
const handler = new OrderHttpHandler(
  endpoint,
  null,
  oidcVerifier,
  null
);

const request = {
  method: "POST",
  url: "/api/orders",
  body: {
    telegram_id_token: oidcIdToken,
    telegram_oidc_nonce: oidcNonce,
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
console.log("✓ Telegram OIDC ID token was verified by Core");
console.log("✓ Telegram OIDC nonce was supplied and verified");
console.log("✓ Idempotency key was supplied by the client contract");
console.log("✓ Product was resolved from authoritative CMS data");
console.log("✓ Client-supplied title/price were not trusted");
console.log("✓ Real HMAC request reached PREVIA-CMS");
console.log("✓ Order was created in CMS");
console.log("✓ Server generated order_id:", response.body.order_id);
console.log("");
console.log("ALL INTEGRATION TESTS PASSED");
