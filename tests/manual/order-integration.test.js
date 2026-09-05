import {
  OrderService,
  CmsOrderRepository,
  OrderEndpoint,
  OrderHttpHandler
} from "../../src/index.js";

const cmsUrl = process.env.PREVIA_CMS_URL;
const hmacSecret = process.env.PREVIA_CORE_HMAC_SECRET;

if (!cmsUrl) {
  throw new Error("PREVIA_CMS_URL is not set");
}

if (!hmacSecret) {
  throw new Error("PREVIA_CORE_HMAC_SECRET is not set");
}

console.log("=== PREVIA Core → CMS Integration Test ===");
console.log("CMS URL:", cmsUrl);

const repository = new CmsOrderRepository(
  cmsUrl,
  hmacSecret
);

const service = new OrderService(repository);
const endpoint = new OrderEndpoint(service);
const handler = new OrderHttpHandler(endpoint);

const testOrder = {
  provider: "web",
  customer_name: "PREVIA Integration Test",
  phone: "+380000000000",
  email: "integration@test.previa",
  contact_preferences: ["call"],
  payment_method: "nova_poshta_prepayment",
  items: [
    {
      sku: "INTEGRATION-TEST",
      title: "PREVIA Integration Test Product",
      price: 1,
      quantity: 1
    }
  ]
};

const request = {
  method: "POST",
  url: "/api/orders",
  body: testOrder
};

const response = await handler.create(request);

console.log("HTTP status:", response.status);
console.log("Response:", JSON.stringify(response.body, null, 2));

if (response.status !== 200) {
  throw new Error(
    `Integration test failed with HTTP ${response.status}`
  );
}

if (!response.body?.success) {
  throw new Error("CMS did not confirm order creation");
}

console.log("");
console.log("✓ Real request reached PREVIA-CMS");
console.log("✓ Order created in CMS");
console.log("✓ Server generated order_id:", response.body.order_id);
console.log("");
console.log("ALL INTEGRATION TESTS PASSED");
