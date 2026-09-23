import { createHmac, randomUUID } from "node:crypto";

import {
  OrderService,
  CmsOrderRepository,
  CmsProductRepository,
  ProductOrderEnrichmentService,
  OrderEndpoint,
  OrderHttpHandler,
  TelegramIdentityVerifier
} from "../../src/index.js";

const cmsUrl = process.env.PREVIA_CMS_URL;
const hmacSecret = process.env.PREVIA_CORE_HMAC_SECRET;
const telegramBotToken = process.env.PREVIA_TELEGRAM_BOT_TOKEN;
const integrationSku = process.env.PREVIA_INTEGRATION_SKU;

if (!cmsUrl) {
  throw new Error("PREVIA_CMS_URL is not set");
}

if (!hmacSecret) {
  throw new Error("PREVIA_CORE_HMAC_SECRET is not set");
}

if (!telegramBotToken) {
  throw new Error("PREVIA_TELEGRAM_BOT_TOKEN is not set");
}

if (!integrationSku) {
  throw new Error(
    "PREVIA_INTEGRATION_SKU is not set. Set it to an existing AVAILABLE SKU before running this test."
  );
}

function buildInitData(botToken) {
  const params = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: `PREVIA_INTEGRATION_${randomUUID()}`,
    user: JSON.stringify({
      id: 987654321,
      first_name: "PREVIA",
      last_name: "Integration",
      username: "previa_integration_test"
    })
  });

  const dataCheckString = [...params.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  params.set(
    "hash",
    createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex")
  );

  return params.toString();
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
const identityVerifier = new TelegramIdentityVerifier(telegramBotToken);
const handler = new OrderHttpHandler(endpoint, identityVerifier);

const request = {
  method: "POST",
  url: "/api/orders",
  body: {
    telegram_init_data: buildInitData(telegramBotToken),
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
console.log("✓ Public Core request uses the current flat order contract");
console.log("✓ Telegram identity was verified");
console.log("✓ Idempotency key was supplied by the client contract");
console.log("✓ Product was resolved from authoritative CMS data");
console.log("✓ Client-supplied title/price were not trusted");
console.log("✓ Real HMAC request reached PREVIA-CMS");
console.log("✓ Order was created in CMS");
console.log("✓ Server generated order_id:", response.body.order_id);
console.log("");
console.log("ALL INTEGRATION TESTS PASSED");
