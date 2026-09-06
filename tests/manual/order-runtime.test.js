import assert from "node:assert/strict";

import {
  OrderService,
  CmsOrderRepository
} from "../../src/index.js";

console.log("=== PREVIA Core Order Runtime Test ===");

let receivedEnvelope = null;

const fakeTransport = {
  async post(envelope) {
    receivedEnvelope = envelope;

    return {
      success: true,
      code: "ORDER_CREATED",
      order: {
        order_id: "ORD-TEST-001",
        created_at: "2026-09-05T00:00:00.000Z"
      },
      items_count: 1
    };
  }
};

const repository = new CmsOrderRepository(
  "http://fake-cms.local",
  "test-secret",
  fakeTransport
);

const service = new OrderService(repository);

const result = await service.saveOrder({
  provider: "telegram",
  providerId: "test-user-001",
  telegram_name: "previa_test",
  customer_name: "Тест PREVIA",
  phone: "+380000000000",
  email: "test@previa.local",
  contact_preferences: ["telegram"],
  payment_method: "nova_poshta_prepayment",
  items: [
    {
      sku: "TEST-001",
      title: "Test Product",
      price: 100,
      quantity: 1
    }
  ]
});

assert.ok(result);
assert.ok(result.order);
assert.ok(result.items);
assert.match(result.order.order_id, /^ORD-/);
assert.notEqual(result.order.order_id, "ORD-TEST-001");
assert.ok(result.order.created_at);
assert.equal(result.order.provider, "telegram");
assert.equal(result.order.contact_preferences[0], "telegram");
assert.equal(result.order.subtotal, 100);
assert.equal(result.order.total, 100);

assert.equal(result.items.length, 1);
assert.equal(result.items[0].sku, "TEST-001");
assert.equal(result.items[0].quantity, 1);
assert.equal(result.items[0].subtotal, 100);
assert.equal(result.items[0].order_id, result.order.order_id);

assert.ok(receivedEnvelope);
assert.equal(receivedEnvelope.action, "order.create");
assert.equal(receivedEnvelope.auth.version, "v1");
assert.equal(receivedEnvelope.auth.key_id, "core-v1");

const cmsPayload = JSON.parse(receivedEnvelope.payload);
assert.ok(cmsPayload.order);
assert.ok(cmsPayload.items);
assert.equal(cmsPayload.order.order_id, result.order.order_id);
assert.equal(cmsPayload.order.provider, "telegram");
assert.equal(cmsPayload.items[0].sku, "TEST-001");

await assert.rejects(
  () => service.saveOrder({
    provider: "telegram",
    providerId: "test-user-001",
    telegram_name: "previa_test",
    customer_name: "Тест PREVIA",
    phone: "+380000000000",
    email: "test@previa.local",
    contact_preferences: ["telegram"],
    payment_method: "nova_poshta_prepayment",
    order_id: "CLIENT-CANNOT-SET",
    items: [
      {
        sku: "TEST-001",
        title: "Test Product",
        price: 100,
        quantity: 1
      }
    ]
  }),
  error => error.code === "VALIDATION_ERROR" && error.retryable === false
);

console.log("");
console.log("✓ Canonical order created by Core");
console.log("✓ Canonical OrderItem created by Core");
console.log("✓ CMS response acknowledged correctly");
console.log("✓ HMAC envelope created");
console.log("✓ Totals calculated by Core");
console.log("✓ Server-owned order_id rejected from client input");
console.log("");
console.log("ALL RUNTIME TESTS PASSED");
