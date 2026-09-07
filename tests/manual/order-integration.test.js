import { createHmac } from "node:crypto";

import {
  OrderService,
  CmsOrderRepository,
  OrderEndpoint,
  OrderHttpHandler,
  TelegramIdentityVerifier
} from "../../src/index.js";

const cmsUrl = process.env.PREVIA_CMS_URL;
const hmacSecret = process.env.PREVIA_CORE_HMAC_SECRET;
const telegramBotToken = process.env.PREVIA_TELEGRAM_BOT_TOKEN;

if (!cmsUrl) {
  throw new Error("PREVIA_CMS_URL is not set");
}

if (!hmacSecret) {
  throw new Error("PREVIA_CORE_HMAC_SECRET is not set");
}

if (!telegramBotToken) {
  throw new Error("PREVIA_TELEGRAM_BOT_TOKEN is not set");
}

function buildInitData(botToken) {
  const params = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000)),
    query_id: "AAH_PREVIA_INTEGRATION_TEST",
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

const repository = new CmsOrderRepository(
  cmsUrl,
  hmacSecret
);

const service = new OrderService(repository);
const endpoint = new OrderEndpoint(service);
const identityVerifier = new TelegramIdentityVerifier(telegramBotToken);
const handler = new OrderHttpHandler(endpoint, identityVerifier);

const request = {
  method: "POST",
  url: "/api/orders",
  body: {
    telegram_init_data: buildInitData(telegramBotToken),
    order: {
      customer_name: "PREVIA Integration Test",
      phone: "+380000000000",
      email: "integration@test.previa",
      contact_preferences: ["telegram"],
      payment_method: "nova_poshta_prepayment"
    },
    items: [
      {
        sku: "INTEGRATION-TEST",
        title: "PREVIA Integration Test Product",
        price: 1,
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
console.log("✓ Telegram identity verified");
console.log("✓ Real request reached PREVIA-CMS");
console.log("✓ Order created in CMS");
console.log("✓ Server generated order_id:", response.body.order_id);
console.log("");
console.log("ALL INTEGRATION TESTS PASSED");
